"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DatePickerField } from "./components/DatePickerField";
import { ChevronLeftIcon } from "./components/icons";
import { cn, tkAsk } from "./formStyles";
import { useQueryClient } from "@tanstack/react-query";
import { getSupabase } from "@/lib/supabase/client";
import { useCurrentUser, useProfile } from "@/lib/queries/profile";
import { useCreateListing } from "@/lib/mutations/listings";

const DURATION_MIN = 30;
const DURATION_MAX = 240;
const DURATION_STEP = 30;

function formatDurationLabel(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  const hourPart = h === 1 ? "1 hr" : `${h} hrs`;
  return `${hourPart} ${m} min`;
}

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function hourBalanceToNumber(raw: unknown): number {
  if (raw == null) return 0;
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

export default function AskPage() {
  const router = useRouter();
  const [need, setNeed] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [neededDay, setNeededDay] = useState<string>(() => todayIsoDate());
  const [submitError, setSubmitError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();
  const { data: profile, isPending: profilePending } = useProfile(user?.id);
  const createListing = useCreateListing();

  const balanceHours = profilePending ? null : hourBalanceToNumber(profile?.hour_balance);
  const balanceMins = (balanceHours ?? 0) * 60;
  const maxAffordableMins =
    balanceMins >= DURATION_MIN
      ? Math.min(DURATION_MAX, Math.floor(balanceMins / DURATION_STEP) * DURATION_STEP)
      : 0;
  const canAffordAnyTask = maxAffordableMins >= DURATION_MIN;
  const boundedDurationMins =
    balanceHours !== null && canAffordAnyTask
      ? Math.min(Math.max(durationMins, DURATION_MIN), maxAffordableMins)
      : durationMins;
  const durationFitsBalance = balanceHours === null || boundedDurationMins <= balanceMins + 1e-9;

  const canSubmit =
    need.trim().length > 0 &&
    neededDay.length > 0 &&
    !createListing.isPending &&
    balanceHours !== null &&
    canAffordAnyTask &&
    durationFitsBalance;

  const durationLabel = useMemo(() => formatDurationLabel(boundedDurationMins), [boundedDurationMins]);
  
  async function handlePostRequest() {
    if (createListing.isPending) return;
    if (!need.trim() || !neededDay.length) return;
    setSubmitError(null);

    if (!user) {
      setSubmitError("You need to be signed in to post.");
      return;
    }

    const lat = profile?.lat ?? null;
    const lng = profile?.lng ?? null;
    if (lat == null || lng == null) {
      setSubmitError("Add your location to your profile before posting a request.");
      return;
    }

    const hoursAvailable = hourBalanceToNumber(profile?.hour_balance);
    if (boundedDurationMins / 60 > hoursAvailable + 1e-9) {
      setSubmitError(
        "This task is longer than your hour balance. Shorten the time or earn more hours first.",
      );
      return;
    }

    try {
      await createListing.mutateAsync({
        posted_by: user.id,
        posted_by_name: profile?.full_name ?? null,
        description: need.trim(),
        duration_minutes: boundedDurationMins,
        needed_by: neededDay,
        lat,
        lng,
        status: "open",
      });
      const hoursToDeduct = boundedDurationMins / 60;
      const newBalance = hoursAvailable - hoursToDeduct;
      try {
        const { error: balErr } = await getSupabase()
          .from("profiles")
          .update({ hour_balance: newBalance })
          .eq("id", user.id);
        if (!balErr) {
          queryClient.setQueryData(["profile", user.id, "balance"], newBalance);
          queryClient.setQueryData(["profile", user.id], (old: unknown) => {
            if (!old || typeof old !== "object") return old;
            return { ...(old as object), hour_balance: newBalance };
          });
        }
      } catch {
        // Balance will self-heal on next profile refresh
      }
      router.push(`/ask/success?mins=${boundedDurationMins}`);
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  }

  return (
    <div className={tkAsk.shell}>
      <main className={tkAsk.main}>
        <header className={tkAsk.headerRow}>
          <Link href="/home" className={tkAsk.backButton} aria-label="Back to home">
            <ChevronLeftIcon className="text-tk-forest" />
          </Link>
          <h1 className={tkAsk.headerTitle}>Ask for help</h1>
        </header>

        <section className="flex flex-col gap-2" aria-labelledby="need-label">
          <label id="need-label" htmlFor="need-help" className={tkAsk.sectionLabel}>
            What do you need?
          </label>
          <textarea
            id="need-help"
            className={tkAsk.textarea}
            placeholder="Describe what you need help with..."
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            rows={5}
          />
        </section>

        <section className={tkAsk.durationCard} aria-labelledby="duration-label">
          <div className={tkAsk.durationHeaderRow}>
            <p id="duration-label" className={tkAsk.durationQuestion}>
              How long will it take?
            </p>
            <span className={tkAsk.durationPill}>{durationLabel}</span>
          </div>
          <input
            type="range"
            className={tkAsk.slider}
            min={DURATION_MIN}
            max={canAffordAnyTask ? maxAffordableMins : DURATION_MAX}
            step={DURATION_STEP}
            value={boundedDurationMins}
            onChange={(e) => setDurationMins(Number(e.target.value))}
            disabled={balanceHours !== null && !canAffordAnyTask}
            aria-valuemin={DURATION_MIN}
            aria-valuemax={canAffordAnyTask ? maxAffordableMins : DURATION_MAX}
            aria-valuenow={boundedDurationMins}
            aria-label="Estimated duration"
          />
          <div className={tkAsk.sliderLabelsRow}>
            <span>30 min</span>
            <span>
              {canAffordAnyTask ? formatDurationLabel(maxAffordableMins) : "4 hours"} max
            </span>
          </div>
          {balanceHours !== null && !canAffordAnyTask ? (
            <p className={tkAsk.submitError} role="status">
              You need at least 30 minutes in your hour balance to post a request.
            </p>
          ) : balanceHours !== null && !durationFitsBalance ? (
            <p className={tkAsk.submitError} role="status">
              Choose a duration up to {formatDurationLabel(maxAffordableMins)} (your current balance).
            </p>
          ) : null}
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="when-label">
          <p id="when-label" className={tkAsk.sectionLabel}>
            When do you need it?
          </p>
          <DatePickerField id="needed-day" value={neededDay} onChange={setNeededDay} />
        </section>

        {submitError ? (
          <p className={tkAsk.submitError} role="alert">
            {submitError}
          </p>
        ) : null}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handlePostRequest}
          className={cn(tkAsk.primaryButton, !canSubmit && tkAsk.primaryButtonDisabled)}
        >
          {createListing.isPending ? "Posting…" : "Post your request"}
        </button>
      </main>
    </div>
  );
}
