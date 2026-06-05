"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  GiftIcon,
  ListPostsIcon,
  LogOutIcon,
  PinIcon,
} from "./components/icons";
import { cn, tkYou } from "./formStyles";
import { getSupabase } from "@/lib/supabase/client";
import { useCurrentUser, useProfile } from "@/lib/queries/profile";
import { useMyHistory } from "@/lib/queries/listings";
import { useGiftHours, useUpdateRadius } from "@/lib/mutations/profile";

const DEFAULT_HOUR_BALANCE = 3;
const GIFT_STEP_MINUTES = 30;
const RADIUS_MIN = 1;
const RADIUS_MAX = 10;
const RADIUS_STEP = 0.25;
const RADIUS_SAVE_DEBOUNCE_MS = 450;
const GIFT_SEARCH_DEBOUNCE_MS = 320;

function hourBalanceToMinutes(hourBalance: unknown): number {
  if (hourBalance == null) return DEFAULT_HOUR_BALANCE * 60;
  const n =
    typeof hourBalance === "string" ? parseFloat(hourBalance) : Number(hourBalance);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_HOUR_BALANCE * 60;
  return n * 60;
}

function formatBalanceHoursLabel(totalMins: number): string {
  if (totalMins <= 0) return "0 hours";
  const hours = totalMins / 60;
  if (Number.isInteger(hours)) return hours === 1 ? "1 hour" : `${hours} hours`;
  const text = hours.toFixed(1).replace(/\.0$/, "");
  return `${text} hours`;
}

function initialsFromName(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)).toUpperCase();
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
  deltaHours: number;
};

type GiftRecipientOption = {
  id: string;
  username: string | null;
  full_name: string | null;
};

function truncateListingTitle(text: string, maxLen = 72): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1)}…`;
}

function formatCompletedWhen(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
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

function parseRadiusMilesDb(raw: unknown): number | null {
  if (raw == null) return null;
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.min(RADIUS_MAX, Math.max(RADIUS_MIN, n));
}

function formatRadiusMi(miles: number): string {
  const rounded = Math.round(miles * 100) / 100;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return `${rounded} mi`;
  const s = rounded.toFixed(2).replace(/\.?0+$/, "");
  return `${s} mi`;
}

function formatDeltaHours(h: number): string {
  const unit = Math.abs(h) === 1 ? "hr" : "hrs";
  const text = h % 1 === 0 ? String(h) : h.toFixed(1).replace(/\.0$/, "");
  const prefix = h > 0 ? "+" : "";
  return `${prefix}${text} ${unit}`;
}

function giftStepCenterParts(mins: number): { num: string; unit: string } {
  if (mins < 60) return { num: String(mins), unit: "min" };
  const h = mins / 60;
  if (mins % 60 === 0) return { num: String(h), unit: h === 1 ? "hour" : "hours" };
  const dec = mins / 60;
  const num = dec % 1 === 0 ? String(dec) : dec.toFixed(1).replace(/\.0$/, "");
  return { num, unit: "hours" };
}

function sendGiftLabelMinutes(mins: number): string {
  if (mins < 60) return `Send ${mins} min`;
  const h = mins / 60;
  if (mins % 60 === 0) return h === 1 ? "Send 1 hour" : `Send ${h} hours`;
  const dec = mins / 60;
  const n = dec.toFixed(1).replace(/\.0$/, "");
  return `Send ${n} hours`;
}

export default function YouPage() {
  const router = useRouter();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [radiusMiles, setRadiusMiles] = useState(5);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftMinutes, setGiftMinutes] = useState(60);
  const [giftSearchQuery, setGiftSearchQuery] = useState("");
  const [giftSearchDebounced, setGiftSearchDebounced] = useState("");
  const [giftSearchResults, setGiftSearchResults] = useState<GiftRecipientOption[]>([]);
  const [giftSearchLoading, setGiftSearchLoading] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<GiftRecipientOption | null>(null);
  const [giftSending, setGiftSending] = useState(false);
  const [giftError, setGiftError] = useState<string | null>(null);
  const [giftSearchDropdownOpen, setGiftSearchDropdownOpen] = useState(false);

  const sessionUserIdRef = useRef<string | null>(null);
  const radiusSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const giftSearchWrapRef = useRef<HTMLDivElement | null>(null);
  const radiusDirtyRef = useRef(false);

  const { data: user } = useCurrentUser();
  const { data: profile, isPending: profilePending } = useProfile(user?.id);
  const { data: historyData } = useMyHistory(user?.id);
  const giftHoursMutation = useGiftHours(user?.id);
  const updateRadiusMutation = useUpdateRadius(user?.id);

  // Keep ref in sync for use in timeout callbacks
  useEffect(() => {
    sessionUserIdRef.current = user?.id ?? null;
  }, [user?.id]);

  // Sync radius from profile on initial load (skip if user has already moved slider)
  useEffect(() => {
    if (!profile || radiusDirtyRef.current) return;
    const parsed = parseRadiusMilesDb(profile.radius_miles);
    if (parsed != null) setRadiusMiles(parsed);
  }, [profile?.radius_miles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cap giftMinutes to balance whenever balance changes
  const balanceMinutes = useMemo(
    () => (profile ? hourBalanceToMinutes(profile.hour_balance) : DEFAULT_HOUR_BALANCE * 60),
    [profile]
  );

  useEffect(() => {
    if (!profile) return;
    setGiftMinutes((m) =>
      Math.min(Math.max(m, GIFT_STEP_MINUTES), Math.max(balanceMinutes, GIFT_STEP_MINUTES))
    );
  }, [balanceMinutes, profile]);

  // Derived display values
  const { displayName, usernameHandle, avatarInitials } = useMemo(() => {
    if (!profile) return { displayName: "…", usernameHandle: "@—", avatarInitials: "?" };
    const meta = (user?.user_metadata ?? {}) as Record<string, string | undefined>;
    const name =
      (profile.full_name && String(profile.full_name).trim()) ||
      meta.name?.trim() ||
      (user?.email?.split("@")[0] ?? "");
    const username =
      (profile.username && String(profile.username).trim()) || meta.username?.trim() || "";
    return {
      displayName: name || "Neighbor",
      usernameHandle: formatUsernameHandle(username),
      avatarInitials: initialsFromName(name || username || "?"),
    };
  }, [profile, user]);

  const profileLoaded = !profilePending;

  const history = useMemo((): HistoryEntry[] => {
    if (!historyData) return [];
    return historyData.listings.map((row) => {
      const requester = (row.posted_by && historyData.nameById[row.posted_by]) || "Neighbor";
      const when = formatCompletedWhen(row.completed_at);
      const deltaHours = (Number(row.duration_minutes) || 0) / 60;
      return {
        id: row.id,
        emoji: "👏",
        title: truncateListingTitle(row.description?.trim() || "Helped a neighbor"),
        detail: `with ${firstNameFromFull(requester)} · ${when}`,
        deltaHours,
      };
    });
  }, [historyData]);

  // Gift search debounce
  useEffect(() => {
    const t = setTimeout(() => setGiftSearchDebounced(giftSearchQuery), GIFT_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [giftSearchQuery]);

  // Gift search dropdown close on outside click
  useEffect(() => {
    if (!giftOpen) {
      setGiftSearchDropdownOpen(false);
      return;
    }
    function handlePointerDown(e: PointerEvent) {
      const wrap = giftSearchWrapRef.current;
      if (!wrap) return;
      const t = e.target;
      if (t instanceof Node && wrap.contains(t)) return;
      setGiftSearchDropdownOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => document.removeEventListener("pointerdown", handlePointerDown, true);
  }, [giftOpen]);

  // Gift username search
  useEffect(() => {
    if (!giftOpen) return;
    const qNorm = giftSearchDebounced.trim().replace(/^@+/, "").trim();
    let cancelled = false;

    async function runSearch() {
      if (qNorm.length === 0) {
        if (!cancelled) { setGiftSearchResults([]); setGiftSearchLoading(false); }
        return;
      }
      setGiftSearchLoading(true);
      const { data, error } = await getSupabase().rpc("search_profiles_by_username", {
        search_query: qNorm,
      });
      if (cancelled) return;
      setGiftSearchLoading(false);
      if (error) { console.error("Neighbor search failed:", error.message); setGiftSearchResults([]); return; }
      setGiftSearchResults((data ?? []) as GiftRecipientOption[]);
    }

    void runSearch();
    return () => { cancelled = true; };
  }, [giftSearchDebounced, giftOpen]);

  function persistRadiusMiles(miles: number) {
    if (!sessionUserIdRef.current) return;
    updateRadiusMutation.mutate(miles, {
      onError: (err) => console.error("Could not save radius:", (err as Error).message),
    });
  }

  function handleRadiusSliderChange(nextMiles: number) {
    radiusDirtyRef.current = true;
    setRadiusMiles(nextMiles);
    if (!sessionUserIdRef.current) return;
    if (radiusSaveTimerRef.current) clearTimeout(radiusSaveTimerRef.current);
    radiusSaveTimerRef.current = setTimeout(() => {
      radiusSaveTimerRef.current = null;
      persistRadiusMiles(nextMiles);
    }, RADIUS_SAVE_DEBOUNCE_MS);
  }

  const radiusLabel = useMemo(() => formatRadiusMi(radiusMiles), [radiusMiles]);
  const giftCenter = useMemo(() => giftStepCenterParts(giftMinutes), [giftMinutes]);
  const balanceHoursLabel = useMemo(() => formatBalanceHoursLabel(balanceMinutes), [balanceMinutes]);

  const canSendGift =
    !!user?.id &&
    !!selectedRecipient &&
    giftMinutes >= GIFT_STEP_MINUTES &&
    giftMinutes <= balanceMinutes &&
    !giftSending;

  const bumpGiftMinutes = (delta: number) => {
    setGiftMinutes((m) => {
      const next = m + delta;
      return Math.min(balanceMinutes, Math.max(GIFT_STEP_MINUTES, next));
    });
  };

  async function handleSendGift() {
    const uid = sessionUserIdRef.current;
    if (!uid || !selectedRecipient) {
      setGiftError(uid ? "Pick a neighbor to gift." : "Sign in to gift hours.");
      return;
    }
    setGiftSending(true);
    setGiftError(null);
    try {
      await giftHoursMutation.mutateAsync({
        recipientId: selectedRecipient.id,
        giftHours: giftMinutes / 60,
      });
      setSelectedRecipient(null);
      setGiftSearchQuery("");
      setGiftSearchResults([]);
    } catch (err) {
      setGiftError((err as Error).message || "Could not send hours. Try again.");
    } finally {
      setGiftSending(false);
    }
  }

  async function handleSignOut() {
    if (signOutLoading) return;
    setSignOutLoading(true);
    const { error } = await getSupabase().auth.signOut();
    setSignOutLoading(false);
    if (error) console.error("Sign out failed:", error.message);
    router.replace("/auth/sign-in");
    router.refresh();
  }

  return (
    <div className={tkYou.shell}>
      <main className={tkYou.main}>
        <header className={tkYou.topRow}>
          <h1 className={tkYou.pageTitle}>You</h1>
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
              <p className={tkYou.handle}>{profileLoaded ? usernameHandle : "…"}</p>
              <p className={tkYou.balanceBadge}>
                <ClockIcon className="text-tk-terracotta" />
                {profileLoaded ? balanceHoursLabel : "…"}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="myposts-heading">
          <h2 id="myposts-heading" className="sr-only">Your posts</h2>
          <Link href="/you/myposts" className={tkYou.myPostsNavLink}>
            <span className={tkYou.myPostsNavIconWrap} aria-hidden>
              <ListPostsIcon className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={tkYou.giftTitle}>My posts</span>
              <span className={tkYou.giftSub}>View, edit, or delete your requests</span>
            </span>
            <ChevronRightIcon className={tkYou.giftChevron} />
          </Link>
        </section>

        <section aria-labelledby="history-heading">
          <div className={tkYou.sectionHeaderRow}>
            <h2 id="history-heading" className={tkYou.sectionTitle}>History</h2>
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
                When you mark a request complete, the hours you earned show up here.
              </p>
            ) : (
              <ul className="divide-y divide-tk-border/80">
                {history.map((row) => (
                  <li key={row.id}>
                    <div className={tkYou.historyRow}>
                      <span className={tkYou.historyEmoji} aria-hidden>{row.emoji}</span>
                      <div className={tkYou.historyBody}>
                        <p className={tkYou.historyTitle}>{row.title}</p>
                        <p className={tkYou.historySub}>{row.detail}</p>
                      </div>
                      <p className={tkYou.historyDeltaPlus}>{formatDeltaHours(row.deltaHours)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="gift-heading">
          <h2 id="gift-heading" className="sr-only">Gift hours</h2>
          <div className={cn(tkYou.giftDisclosure, giftOpen && tkYou.giftDisclosureOpen)}>
            <button
              type="button"
              id="gift-hours-trigger"
              aria-expanded={giftOpen}
              aria-controls="gift-hours-panel"
              onClick={() => setGiftOpen((o) => !o)}
              className={tkYou.giftTrigger}
            >
              <span className={cn(tkYou.giftIconWrap, giftOpen && tkYou.giftIconWrapOpen)}>
                <GiftIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className={tkYou.giftTitle}>Gift hours</span>
                <span className={tkYou.giftSub}>Share your hours with a neighbor</span>
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
                <label htmlFor="gift-recipient-search" className={tkYou.giftFieldLabel}>
                  Find a neighbor by username
                </label>
                <div ref={giftSearchWrapRef} className={tkYou.giftSearchWrap}>
                  <input
                    id="gift-recipient-search"
                    type="search"
                    autoComplete="off"
                    placeholder="Search @username"
                    value={giftSearchQuery}
                    onFocus={() => setGiftSearchDropdownOpen(true)}
                    onChange={(e) => {
                      setGiftSearchQuery(e.target.value);
                      setGiftSearchDropdownOpen(true);
                      setSelectedRecipient(null);
                      setGiftError(null);
                    }}
                    className={tkYou.giftSearchInput}
                  />
                  {giftSearchDropdownOpen && giftSearchQuery.trim().length > 0 ? (
                    <div
                      className={tkYou.giftSearchResults}
                      role="listbox"
                      aria-label="Matching neighbors"
                    >
                      {giftSearchLoading ? (
                        <p className={tkYou.giftSearchEmpty}>Searching…</p>
                      ) : giftSearchResults.length === 0 ? (
                        <p className={tkYou.giftSearchEmpty}>No matches</p>
                      ) : (
                        giftSearchResults.map((r) => {
                          const fn = r.full_name?.trim();
                          const un = r.username?.trim();
                          const label = fn || (un ? `@${un}` : "Neighbor");
                          const initials = initialsFromName(fn || un || "?");
                          const selected = selectedRecipient?.id === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                setSelectedRecipient(r);
                                setGiftSearchQuery(un ? `@${un}` : "");
                                setGiftSearchDropdownOpen(false);
                                setGiftError(null);
                              }}
                              className={tkYou.giftSearchResultBtn}
                            >
                              <span
                                className={cn(
                                  tkYou.giftNeighborAvatar,
                                  selected && tkYou.giftNeighborAvatarOn,
                                )}
                                aria-hidden
                              >
                                {initials}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate font-medium text-tk-forest">
                                  {label}
                                </span>
                                {fn && un ? (
                                  <span className="block truncate text-xs text-tk-muted">@{un}</span>
                                ) : null}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  ) : null}
                </div>
                <p className={tkYou.giftSearchHint}>
                  Choose someone from the list—hours send only to the selected profile.
                </p>

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
                      <span className={tkYou.giftHourValue}>{giftCenter.num}</span>
                      <span className={tkYou.giftHourWord}>{giftCenter.unit}</span>
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
                  onClick={() => void handleSendGift()}
                >
                  {giftSending ? (
                    "Sending…"
                  ) : (
                    <>
                      {sendGiftLabelMinutes(giftMinutes)}
                      <ArrowRightIcon className="shrink-0 opacity-90" />
                    </>
                  )}
                </button>

                {giftError ? (
                  <p className={tkYou.giftErrorText} role="alert">{giftError}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="settings-heading">
          <h2 id="settings-heading" className={tkYou.sectionTitle}>Settings</h2>
          <div className={tkYou.settingsCard}>
            <div className={tkYou.settingsRow}>
              <span className={tkYou.settingsIconWrap}><PinIcon /></span>
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
                  onChange={(e) => handleRadiusSliderChange(Number(e.target.value))}
                  onPointerUp={(e) => {
                    if (!sessionUserIdRef.current) return;
                    if (radiusSaveTimerRef.current) {
                      clearTimeout(radiusSaveTimerRef.current);
                      radiusSaveTimerRef.current = null;
                    }
                    persistRadiusMiles(Number(e.currentTarget.value));
                  }}
                  aria-label="Neighborhood radius"
                />
              </div>
            </div>

            <div className={tkYou.settingsRowDivider} />

            <div className={tkYou.settingsRow}>
              <span className={tkYou.settingsIconWrap}><LogOutIcon /></span>
              <button
                type="button"
                className={tkYou.signOutButton}
                disabled={signOutLoading}
                onClick={() => void handleSignOut()}
              >
                {signOutLoading ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
