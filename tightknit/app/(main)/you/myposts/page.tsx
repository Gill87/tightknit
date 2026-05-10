"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DatePickerField } from "../../ask/components/DatePickerField";
import { CalendarIcon, ChevronLeftIcon } from "../../ask/components/icons";
import { tkAsk } from "../../ask/formStyles";
import { getSupabase } from "@/lib/supabase/client";
import { ClockIcon, PencilIcon, TrashIcon } from "../components/icons";
import { tkYou } from "../formStyles";
import { cn, tkMyPosts } from "./formStyles";

const DURATION_MIN = 30;
const DURATION_MAX = 240;
const DURATION_STEP = 30;

type ListingRow = {
  id: string;
  description: string | null;
  duration_minutes: number | null;
  needed_by: string | null;
  status: string;
  claimed_by: string | null;
  claimed_at: string | null;
  completed_at: string | null;
  created_at: string;
};

function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function formatDurationLabel(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  const hourPart = h === 1 ? "1 hr" : `${h} hrs`;
  return `${hourPart} ${m} min`;
}

function formatNeededBy(dateStr: string | null): string {
  if (!dateStr) return "Flexible";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function statusBadge(row: ListingRow): {
  label: string;
  className: string;
} {
  if (row.completed_at) {
    return { label: "Completed", className: tkMyPosts.badgeDone };
  }
  if (row.claimed_by) {
    return { label: "Claimed", className: tkMyPosts.badgeClaimed };
  }
  return { label: "Open", className: tkMyPosts.badge };
}

function canEdit(row: ListingRow): boolean {
  return (
    row.completed_at == null &&
    row.claimed_by == null &&
    String(row.status).toLowerCase() === "open"
  );
}

function canDelete(row: ListingRow): boolean {
  return row.completed_at == null;
}

function ListingCard({
  row,
  onUpdated,
  onDeleted,
}: {
  row: ListingRow;
  onUpdated: (next: ListingRow) => void;
  onDeleted: (id: string) => void;
}) {
  const [editField, setEditField] = useState<
    null | "desc" | "needed" | "duration"
  >(null);
  const [draftDesc, setDraftDesc] = useState(row.description ?? "");
  const [draftNeeded, setDraftNeeded] = useState(
    row.needed_by ?? todayIsoDate(),
  );
  const [draftMins, setDraftMins] = useState(
    Math.min(
      DURATION_MAX,
      Math.max(DURATION_MIN, row.duration_minutes ?? DURATION_MIN),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setDraftDesc(row.description ?? "");
    setDraftNeeded(row.needed_by ?? todayIsoDate());
    setDraftMins(
      Math.min(
        DURATION_MAX,
        Math.max(DURATION_MIN, row.duration_minutes ?? DURATION_MIN),
      ),
    );
  }, [row]);

  const editable = canEdit(row);
  const deletable = canDelete(row);
  const badge = statusBadge(row);

  const closeEditor = () => {
    setEditField(null);
    setLocalError(null);
  };

  const savePatch = async (patch: Record<string, unknown>) => {
    setSaving(true);
    setLocalError(null);
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("listings")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id)
      .select()
      .single();

    setSaving(false);
    if (error) {
      setLocalError(error.message);
      return;
    }
    if (data) {
      onUpdated(data as ListingRow);
      closeEditor();
    }
  };

  const handleDelete = async () => {
    if (!deletable || saving) return;
    const ok = window.confirm(
      row.claimed_by
        ? "Delete this request? Someone had claimed it—they may still see an old link."
        : "Delete this request?",
    );
    if (!ok) return;
    setSaving(true);
    setLocalError(null);
    const supabase = getSupabase();
    const { error } = await supabase.from("listings").delete().eq("id", row.id);
    setSaving(false);
    if (error) {
      setLocalError(error.message);
      return;
    }
    onDeleted(row.id);
  };

  const durationLabel = formatDurationLabel(draftMins);

  return (
    <article className={tkMyPosts.card}>
      <p className={tkMyPosts.cardTitle}>
        {(row.description ?? "").trim() || "(No description)"}
      </p>
      <div className={tkMyPosts.metaRow}>
        <span className={cn(tkMyPosts.badge, badge.className)}>
          {badge.label}
        </span>
        <span>Need by {formatNeededBy(row.needed_by)}</span>
        <span>·</span>
        <span>{formatDurationLabel(row.duration_minutes ?? DURATION_MIN)}</span>
      </div>

      <div className={tkMyPosts.actionsRow}>
        <button
          type="button"
          className={tkMyPosts.iconBtn}
          disabled={!editable || saving}
          aria-label="Edit description"
          onClick={() => {
            setEditField((f) => (f === "desc" ? null : "desc"));
            setLocalError(null);
          }}
        >
          <PencilIcon className="h-[18px] w-[18px]" />
        </button>
        <button
          type="button"
          className={tkMyPosts.iconBtn}
          disabled={!editable || saving}
          aria-label="Edit needed-by date"
          onClick={() => {
            setEditField((f) => (f === "needed" ? null : "needed"));
            setLocalError(null);
          }}
        >
          <CalendarIcon className="h-[18px] w-[18px] text-tk-forest" />
        </button>
        <button
          type="button"
          className={tkMyPosts.iconBtn}
          disabled={!editable || saving}
          aria-label="Edit duration"
          onClick={() => {
            setEditField((f) => (f === "duration" ? null : "duration"));
            setLocalError(null);
          }}
        >
          <ClockIcon className="h-[18px] w-[18px] text-tk-terracotta" />
        </button>
        <button
          type="button"
          className={cn(tkMyPosts.iconBtn, tkMyPosts.iconBtnDanger)}
          disabled={!deletable || saving}
          aria-label="Delete post"
          onClick={() => void handleDelete()}
        >
          <TrashIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      {editField === "desc" ? (
        <div className={tkMyPosts.editPanel}>
          <label className={tkAsk.sectionLabel} htmlFor={`desc-${row.id}`}>
            Description
          </label>
          <textarea
            id={`desc-${row.id}`}
            className={cn(tkAsk.textarea, "mt-2 min-h-[100px]")}
            value={draftDesc}
            onChange={(e) => setDraftDesc(e.target.value)}
            rows={4}
          />
          <div className={tkMyPosts.editActions}>
            <button
              type="button"
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnGhost)}
              onClick={closeEditor}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || !draftDesc.trim()}
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnPrimary)}
              onClick={() =>
                void savePatch({ description: draftDesc.trim() })
              }
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : null}

      {editField === "needed" ? (
        <div className={tkMyPosts.editPanel}>
          <p className={tkAsk.sectionLabel}>When do you need it?</p>
          <div className="mt-2">
            <DatePickerField
              id={`needed-${row.id}`}
              value={draftNeeded}
              onChange={setDraftNeeded}
            />
          </div>
          <div className={tkMyPosts.editActions}>
            <button
              type="button"
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnGhost)}
              onClick={closeEditor}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || draftNeeded.length === 0}
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnPrimary)}
              onClick={() => void savePatch({ needed_by: draftNeeded })}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : null}

      {editField === "duration" ? (
        <div className={tkMyPosts.editPanel}>
          <div className={tkAsk.durationCard}>
            <div className={tkAsk.durationHeaderRow}>
              <p className={tkAsk.durationQuestion}>How long will it take?</p>
              <span className={tkAsk.durationPill}>{durationLabel}</span>
            </div>
            <input
              type="range"
              className={tkAsk.slider}
              min={DURATION_MIN}
              max={DURATION_MAX}
              step={DURATION_STEP}
              value={draftMins}
              onChange={(e) => setDraftMins(Number(e.target.value))}
              aria-label="Estimated duration"
            />
            <div className={tkAsk.sliderLabelsRow}>
              <span>30 min</span>
              <span>4 hours</span>
            </div>
          </div>
          <div className={tkMyPosts.editActions}>
            <button
              type="button"
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnGhost)}
              onClick={closeEditor}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              className={cn(tkMyPosts.tinyBtn, tkMyPosts.tinyBtnPrimary)}
              onClick={() =>
                void savePatch({ duration_minutes: draftMins })
              }
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      ) : null}

      {localError ? (
        <p className={cn(tkMyPosts.errorText, "mt-2")} role="alert">
          {localError}
        </p>
      ) : null}
    </article>
  );
}

export default function MyPostsPage() {
  const [rows, setRows] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [gate, setGate] = useState<"unknown" | "in" | "out">("unknown");
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setGate("out");
      setRows([]);
      setLoading(false);
      return;
    }
    setGate("in");
    const { data, error } = await supabase
      .from("listings")
      .select(
        "id, description, duration_minutes, needed_by, status, claimed_by, claimed_at, completed_at, created_at",
      )
      .eq("posted_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as ListingRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={tkYou.shell}>
      <main className={tkYou.main}>
        <header className={tkMyPosts.headerRow}>
          <Link
            href="/you"
            className={tkMyPosts.backButton}
            aria-label="Back to You"
          >
            <ChevronLeftIcon className="text-tk-forest" />
          </Link>
          <h1 className={tkMyPosts.headerTitle}>My posts</h1>
        </header>

        {gate === "out" ? (
          <p className={tkMyPosts.emptyText}>
            Sign in to see your posts.{" "}
            <Link href="/auth/sign-in" className="font-semibold underline">
              Sign in
            </Link>
          </p>
        ) : loading ? (
          <p className={tkMyPosts.emptyText}>Loading…</p>
        ) : loadError ? (
          <p className={cn(tkMyPosts.emptyText, tkMyPosts.errorText)} role="alert">
            {loadError}
          </p>
        ) : rows.length === 0 ? (
          <p className={tkMyPosts.emptyText}>
            You have not posted any requests yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {rows.map((row) => (
              <li key={row.id}>
                <ListingCard
                  row={row}
                  onUpdated={(next) =>
                    setRows((prev) =>
                      prev.map((r) => (r.id === next.id ? next : r)),
                    )
                  }
                  onDeleted={(id) =>
                    setRows((prev) => prev.filter((r) => r.id !== id))
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
