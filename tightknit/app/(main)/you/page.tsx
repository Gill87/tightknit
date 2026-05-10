"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  GearIcon,
  GiftIcon,
  LogOutIcon,
  PinIcon,
} from "./components/icons";
import { cn, tkYou } from "./formStyles";
import { getSupabase } from "@/lib/supabase/client";

/** Fallback when `profiles.hour_balance` is missing (numeric hours in DB) */
const DEFAULT_HOUR_BALANCE = 3;
const GIFT_STEP_MINUTES = 30;

function hourBalanceToMinutes(hourBalance: unknown): number {
  if (hourBalance == null) return DEFAULT_HOUR_BALANCE * 60;
  const n =
    typeof hourBalance === "string"
      ? parseFloat(hourBalance)
      : Number(hourBalance);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_HOUR_BALANCE * 60;
  return n * 60;
}

function formatBalanceHoursLabel(totalMins: number): string {
  if (totalMins <= 0) return "0 hours";
  const hours = totalMins / 60;
  if (Number.isInteger(hours)) {
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
  const text = hours.toFixed(1).replace(/\.0$/, "");
  return `${text} hours`;
}

function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (
      parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
    ).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

function formatUsernameHandle(raw: string): string {
  const u = raw.trim().replace(/^@/, "");
  return u ? `@${u}` : "@—";
}

type HistoryEntry = {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  /** Hours credited when you completed helping (always positive for this feed) */
  deltaHours: number;
};

type CompletedListingRow = {
  id: string;
  description: string | null;
  duration_minutes: number | null;
  completed_at: string | null;
  posted_by: string | null;
};

type PosterNameRow = {
  id: string;
  full_name: string | null;
};

function truncateListingTitle(text: string, maxLen = 72): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

/** Relative label for when the task was completed */
function formatCompletedWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const startYesterday = startToday - 86400000;
  const t = d.getTime();
  if (t >= startToday) return "Today";
  if (t >= startYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function firstNameFromFull(full: string): string {
  const name = full.trim() || "Neighbor";
  const first = name.split(/\s+/)[0] ?? name;
  return first.replace(/\.$/, "");
}

type NeighborOption = {
  id: string;
  initials: string;
  name: string;
};

const MOCK_NEIGHBORS: NeighborOption[] = [
  { id: "sarah", initials: "S", name: "Sarah K." },
  { id: "marcus", initials: "M", name: "Marcus T." },
  { id: "priya", initials: "P", name: "Priya D." },
  { id: "james", initials: "J", name: "James L." },
];

const RADIUS_MIN = 1;
const RADIUS_MAX = 10;
const RADIUS_STEP = 0.25;
const RADIUS_SAVE_DEBOUNCE_MS = 450;

/** Postgres `numeric` often arrives as a string in the browser */
function parseRadiusMilesDb(raw: unknown): number | null {
  if (raw == null) return null;
  const n =
    typeof raw === "string" ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, n));
}

function formatRadiusMi(miles: number): string {
  const rounded = Math.round(miles * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) {
    return `${rounded} mi`;
  }
  const s = rounded.toFixed(2).replace(/\.?0+$/, "");
  return `${s} mi`;
}

function formatDeltaHours(h: number): string {
  const unit = Math.abs(h) === 1 ? "hr" : "hrs";
  const text = h % 1 === 0 ? String(h) : h.toFixed(1).replace(/\.0$/, "");
  const prefix = h > 0 ? "+" : "";
  return `${prefix}${text} ${unit}`;
}

/** Display parts for the duration stepper (30-minute increments). */
function giftStepCenterParts(mins: number): { num: string; unit: string } {
  if (mins < 60) return { num: String(mins), unit: "min" };
  const h = mins / 60;
  if (mins % 60 === 0) {
    return { num: String(h), unit: h === 1 ? "hour" : "hours" };
  }
  const dec = mins / 60;
  const num =
    dec % 1 === 0 ? String(dec) : dec.toFixed(1).replace(/\.0$/, "");
  return { num, unit: "hours" };
}

function sendGiftLabelMinutes(mins: number): string {
  if (mins < 60) return `Send ${mins} min`;
  const h = mins / 60;
  if (mins % 60 === 0) {
    return h === 1 ? "Send 1 hour" : `Send ${h} hours`;
  }
  const dec = mins / 60;
  const n = dec.toFixed(1).replace(/\.0$/, "");
  return `Send ${n} hours`;
}

export default function YouPage() {
  const [radiusMiles, setRadiusMiles] = useState(5);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftNeighborId, setGiftNeighborId] = useState(MOCK_NEIGHBORS[0]!.id);
  const [giftMinutes, setGiftMinutes] = useState(60);

  const [displayName, setDisplayName] = useState("");
  const [usernameHandle, setUsernameHandle] = useState("");
  const [avatarInitials, setAvatarInitials] = useState("?");
  const [balanceMinutes, setBalanceMinutes] = useState(
    DEFAULT_HOUR_BALANCE * 60,
  );
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const sessionUserIdRef = useRef<string | null>(null);
  const radiusSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** True after the user moves the slider; avoids profile fetch overwriting local value */
  const radiusDirtyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        sessionUserIdRef.current = null;
        radiusDirtyRef.current = false;
        if (!cancelled) {
          setHistory([]);
          setProfileLoaded(true);
        }
        return;
      }

      sessionUserIdRef.current = user.id;

      const meta = user.user_metadata as Record<string, string | undefined>;
      const fallbackName = meta?.name?.trim() ?? "";
      const fallbackUsername = meta?.username?.trim() ?? "";

      const [{ data: profile }, { data: completedListings }] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, username, radius_miles, hour_balance")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("listings")
          .select("id, description, duration_minutes, completed_at, posted_by")
          .eq("completed_by", user.id)
          .not("completed_at", "is", null)
          .order("completed_at", { ascending: false }),
      ]);

      if (cancelled) return;

      const listingRows = (completedListings ?? []) as CompletedListingRow[];

      const posterIds = [
        ...new Set(
          listingRows
            .map((row: CompletedListingRow) => row.posted_by)
            .filter((id: string | null): id is string => !!id && id.length > 0),
        ),
      ];

      let nameById: Record<string, string> = {};
      if (posterIds.length > 0) {
        const { data: posters } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", posterIds);
        if (!cancelled && posters) {
          const posterRows = posters as PosterNameRow[];
          nameById = Object.fromEntries(
            posterRows.map((p: PosterNameRow) => {
              const fn = p.full_name != null ? String(p.full_name).trim() : "";
              return [p.id, fn || "Neighbor"] as const;
            }),
          );
        }
      }

      if (cancelled) return;

      const entries: HistoryEntry[] = listingRows.map((row: CompletedListingRow) => {
        const requester =
          (row.posted_by && nameById[row.posted_by]) || "Neighbor";
        const when = formatCompletedWhen(row.completed_at);
        const mins = Number(row.duration_minutes) || 0;
        const deltaHours = mins / 60;
        return {
          id: row.id,
          emoji: "👏",
          title: truncateListingTitle(
            row.description?.trim() || "Helped a neighbor",
          ),
          detail: `with ${firstNameFromFull(requester)} · ${when}`,
          deltaHours,
        };
      });
      setHistory(entries);

      const row = profile as {
        full_name?: string | null;
        username?: string | null;
        radius_miles?: number | null;
        hour_balance?: unknown;
      } | null;
      const name =
        (row?.full_name && String(row.full_name).trim()) ||
        fallbackName ||
        (user.email?.split("@")[0] ?? "");
      const username =
        (row?.username && String(row.username).trim()) || fallbackUsername;

      setDisplayName(name || "Neighbor");
      setUsernameHandle(formatUsernameHandle(username));
      setAvatarInitials(initialsFromName(name || username || "?"));

      const mins = hourBalanceToMinutes(row?.hour_balance);
      setBalanceMinutes(mins);
      setGiftMinutes((m) =>
        Math.min(Math.max(m, GIFT_STEP_MINUTES), Math.max(mins, GIFT_STEP_MINUTES)),
      );

      if (!radiusDirtyRef.current) {
        const parsedRadius = parseRadiusMilesDb(row?.radius_miles);
        if (parsedRadius != null) {
          setRadiusMiles(parsedRadius);
        }
      }

      setProfileLoaded(true);
    }

    void loadProfile();
    return () => {
      cancelled = true;
      if (radiusSaveTimerRef.current) {
        clearTimeout(radiusSaveTimerRef.current);
        radiusSaveTimerRef.current = null;
      }
    };
  }, []);

  async function persistRadiusMiles(miles: number) {
    const uid = sessionUserIdRef.current;
    if (!uid) return;
    const radius_miles =
      Math.round(
        Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, miles)) * 1000,
      ) / 1000;
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update({ radius_miles })
      .eq("id", uid)
      .select("radius_miles");
    if (error) {
      console.error("Could not save radius:", error.message);
      return;
    }
    if (!data?.length) {
      console.error(
        "Radius update affected no rows (check profile row and RLS).",
      );
    }
  }

  function handleRadiusSliderChange(nextMiles: number) {
    radiusDirtyRef.current = true;
    setRadiusMiles(nextMiles);
    if (!sessionUserIdRef.current) return;
    if (radiusSaveTimerRef.current) {
      clearTimeout(radiusSaveTimerRef.current);
    }
    radiusSaveTimerRef.current = setTimeout(() => {
      radiusSaveTimerRef.current = null;
      void persistRadiusMiles(nextMiles);
    }, RADIUS_SAVE_DEBOUNCE_MS);
  }

  const radiusLabel = useMemo(
    () => formatRadiusMi(radiusMiles),
    [radiusMiles],
  );

  const giftCenter = useMemo(
    () => giftStepCenterParts(giftMinutes),
    [giftMinutes],
  );

  const balanceHoursLabel = useMemo(
    () => formatBalanceHoursLabel(balanceMinutes),
    [balanceMinutes],
  );

  const canSendGift =
    giftMinutes >= GIFT_STEP_MINUTES && giftMinutes <= balanceMinutes;

  const bumpGiftMinutes = (delta: number) => {
    setGiftMinutes((m) => {
      const next = m + delta;
      return Math.min(balanceMinutes, Math.max(GIFT_STEP_MINUTES, next));
    });
  };

  return (
    <div className={tkYou.shell}>
      <main className={tkYou.main}>
        <header className={tkYou.topRow}>
          <h1 className={tkYou.pageTitle}>You</h1>
          <button type="button" className={tkYou.iconButton} aria-label="Settings">
            <GearIcon />
          </button>
        </header>

        <section className={tkYou.profileCard} aria-labelledby="profile-name">
          <div className={tkYou.profileRow}>
            <div className={tkYou.avatar} aria-hidden>
              {profileLoaded ? avatarInitials : "…"}
            </div>
            <div className={tkYou.profileTextBlock}>
              <p id="profile-name" className={tkYou.displayName}>
                {profileLoaded ? displayName || "Neighbor" : "…"}
              </p>
              <p className={tkYou.handle}>
                {profileLoaded ? usernameHandle : "…"}
              </p>
              <p className={tkYou.balanceBadge}>
                <ClockIcon className="text-tk-terracotta" />
                {profileLoaded ? balanceHoursLabel : "…"}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="history-heading">
          <div className={tkYou.sectionHeaderRow}>
            <h2 id="history-heading" className={tkYou.sectionTitle}>
              History
            </h2>
            <p className={tkYou.sectionMeta}>
              {profileLoaded
                ? `${history.length} exchange${history.length === 1 ? "" : "s"}`
                : "…"}
            </p>
          </div>
          <div className={tkYou.historyCard}>
            {!profileLoaded ? (
              <p className="px-4 py-8 text-center text-sm text-tk-muted">…</p>
            ) : history.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-tk-muted">
                When you mark a request complete, the hours you earned show up
                here.
              </p>
            ) : (
              <ul className="divide-y divide-tk-border/80">
                {history.map((row) => (
                  <li key={row.id}>
                    <div className={tkYou.historyRow}>
                      <span className={tkYou.historyEmoji} aria-hidden>
                        {row.emoji}
                      </span>
                      <div className={tkYou.historyBody}>
                        <p className={tkYou.historyTitle}>{row.title}</p>
                        <p className={tkYou.historySub}>{row.detail}</p>
                      </div>
                      <p className={tkYou.historyDeltaPlus}>
                        {formatDeltaHours(row.deltaHours)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="gift-heading">
          <h2 id="gift-heading" className="sr-only">
            Gift hours
          </h2>
          <div
            className={cn(
              tkYou.giftDisclosure,
              giftOpen && tkYou.giftDisclosureOpen,
            )}
          >
            <button
              type="button"
              id="gift-hours-trigger"
              aria-expanded={giftOpen}
              aria-controls="gift-hours-panel"
              onClick={() => setGiftOpen((o) => !o)}
              className={tkYou.giftTrigger}
            >
              <span
                className={cn(
                  tkYou.giftIconWrap,
                  giftOpen && tkYou.giftIconWrapOpen,
                )}
              >
                <GiftIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className={tkYou.giftTitle}>Gift hours</span>
                <span className={tkYou.giftSub}>
                  Share your hours with a neighbor
                </span>
              </span>
              {giftOpen ? (
                <ChevronDownIcon className={tkYou.giftChevron} />
              ) : (
                <ChevronRightIcon className={tkYou.giftChevron} />
              )}
            </button>

            {giftOpen ? (
              <div
                id="gift-hours-panel"
                role="region"
                aria-labelledby="gift-hours-trigger"
                className={tkYou.giftPanel}
              >
                <p className={tkYou.giftFieldLabel}>Pick a neighbor</p>
                <div className={tkYou.giftNeighborGrid}>
                  {MOCK_NEIGHBORS.map((n) => {
                    const selected = giftNeighborId === n.id;
                    return (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => setGiftNeighborId(n.id)}
                        className={cn(
                          tkYou.giftNeighborChip,
                          selected
                            ? tkYou.giftNeighborChipOn
                            : tkYou.giftNeighborChipOff,
                        )}
                      >
                        <span
                          className={cn(
                            tkYou.giftNeighborAvatar,
                            selected && tkYou.giftNeighborAvatarOn,
                          )}
                          aria-hidden
                        >
                          {n.initials}
                        </span>
                        <span className="min-w-0 truncate">{n.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className={tkYou.giftStepperSection}>
                  <p className={tkYou.giftFieldLabel}>How long?</p>
                  <div className={tkYou.giftStepperRow}>
                    <button
                      type="button"
                      className={tkYou.giftStepperBtn}
                      aria-label="Decrease duration"
                      disabled={giftMinutes <= GIFT_STEP_MINUTES}
                      onClick={() => bumpGiftMinutes(-GIFT_STEP_MINUTES)}
                    >
                      −
                    </button>
                    <div className={tkYou.giftHourCenter}>
                      <span className={tkYou.giftHourValue}>
                        {giftCenter.num}
                      </span>
                      <span className={tkYou.giftHourWord}>
                        {giftCenter.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={tkYou.giftStepperBtn}
                      aria-label="Increase duration"
                      disabled={giftMinutes >= balanceMinutes}
                      onClick={() => bumpGiftMinutes(GIFT_STEP_MINUTES)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!canSendGift}
                  className={tkYou.giftSendBtn}
                >
                  {sendGiftLabelMinutes(giftMinutes)}
                  <ArrowRightIcon className="shrink-0 opacity-90" />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="settings-heading">
          <h2 id="settings-heading" className={tkYou.sectionTitle}>
            Settings
          </h2>
          <div className={tkYou.settingsCard}>
            <div className={tkYou.settingsRow}>
              <span className={tkYou.settingsIconWrap}>
                <PinIcon />
              </span>
              <div className={tkYou.settingsLabelCol}>
                <div className="flex items-center justify-between gap-3">
                  <p className={tkYou.settingsLabel}>Radius</p>
                  <span className={tkYou.radiusBadge}>{radiusLabel}</span>
                </div>
                <input
                  type="range"
                  className={tkYou.radiusSlider}
                  min={RADIUS_MIN}
                  max={RADIUS_MAX}
                  step={RADIUS_STEP}
                  value={radiusMiles}
                  onChange={(e) =>
                    handleRadiusSliderChange(Number(e.target.value))
                  }
                  onPointerUp={(e) => {
                    const el = e.currentTarget;
                    if (!sessionUserIdRef.current) return;
                    if (radiusSaveTimerRef.current) {
                      clearTimeout(radiusSaveTimerRef.current);
                      radiusSaveTimerRef.current = null;
                    }
                    void persistRadiusMiles(Number(el.value));
                  }}
                  aria-label="Neighborhood radius"
                />
              </div>
            </div>

            <div className={tkYou.settingsRowDivider} />

            <div className={tkYou.settingsRow}>
              <span className={tkYou.settingsIconWrap}>
                <LogOutIcon />
              </span>
              <button type="button" className={tkYou.signOutButton}>
                Sign out
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
