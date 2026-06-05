"use client";

import Link from "next/link";
import { useMemo } from "react";
import { tkHome } from "./formStyles";
import { ChevronRightIcon, ClockIcon, PinIcon, RefreshIcon } from "./components/icons";
import { useCurrentUser, useProfile } from "@/lib/queries/profile";
import { useHomeFeed, type RawListing } from "@/lib/queries/listings";

type FeedItem = {
  id: string;
  initials: string;
  name: string;
  postedAgo: string;
  task: string;
  distance: string;
  durationMins: number;
  nearbyOnly: boolean;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hourBalanceToNumber(raw: unknown): number {
  if (raw == null) return 0;
  const n = typeof raw === "string" ? parseFloat(raw) : Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function isOpenFeedListing(l: RawListing): boolean {
  if (String(l.status ?? "").toLowerCase() !== "open") return false;
  if (l.claimed_by != null) return false;
  if (l.completed_at != null) return false;
  return true;
}

export default function HomePage() {
  const { data: user } = useCurrentUser();
  const profileQuery = useProfile(user?.id);
  const feedQuery = useHomeFeed();

  const profile = profileQuery.data;
  const isLoading = feedQuery.isPending;
  const balance = profileQuery.isPending ? null : hourBalanceToNumber(profile?.hour_balance);

  const listings = useMemo((): FeedItem[] => {
    const raw = feedQuery.data ?? [];
    if (!user || profileQuery.isPending) return [];
    return raw
      .filter((l: RawListing) => l.posted_by !== user.id && isOpenFeedListing(l))
      .map((l: RawListing): FeedItem => {
        const fullName = l.posted_by_name || "Neighbor";
        let distance = "Nearby";
        let nearbyOnly = true;
        if (profile?.lat && profile?.lng && l.lat && l.lng) {
          const d = haversine(profile.lat, profile.lng, l.lat, l.lng);
          distance = d < 0.1 ? "Same block" : `${d.toFixed(1)} mi away`;
          nearbyOnly = d <= (Number(profile.radius_miles) || 5);
        }
        return {
          id: l.id,
          initials: getInitials(fullName),
          name: fullName,
          postedAgo: timeAgo(l.created_at),
          task: l.description,
          distance,
          durationMins: l.duration_minutes,
          nearbyOnly,
        };
      });
  }, [feedQuery.data, user, profile, profileQuery.isPending]);

  const nearby = listings.filter((r) => r.nearbyOnly);

  function handleRefresh() {
    feedQuery.refetch();
    profileQuery.refetch();
  }

  return (
    <div className={tkHome.shell}>
      <main className={tkHome.main}>
        <header className={tkHome.headerStack}>
          <p className={tkHome.headerEyebrow}>Tightknit</p>
          <h1 className={tkHome.headerTitle}>Home</h1>
        </header>

        <div className={tkHome.heroRow}>
          <section
            className={tkHome.balanceSection}
            aria-labelledby="balance-heading"
          >
            <p id="balance-heading" className={tkHome.balanceLabel}>
              Your balance
            </p>
            <p className={tkHome.balanceValue} aria-live="polite">
              {balance === null ? (
                <span className="text-tk-muted" aria-busy="true">
                  …
                </span>
              ) : (
                `${balance} hours`
              )}
            </p>
            <p className={tkHome.balanceHint}>
              {balance === null ? (
                <span className="text-tk-muted">Loading your balance…</span>
              ) : (
                <>
                  You have {balance} hours to spend or share with neighbors.
                </>
              )}
            </p>
          </section>

          <Link href="/ask" className={tkHome.askHelpButton}>
            <span className={tkHome.emojiLarge} aria-hidden>
              🙋
            </span>
            <span className={tkHome.askHelpLabel}>Ask for help</span>
          </Link>
        </div>

        <section aria-label="Filter requests">
          <div className={tkHome.filterRow}>
            <span className={tkHome.filterChipActive}>Nearby</span>
          </div>
        </section>

        <section className={tkHome.feedSection}>
          {isLoading ? (
            <p className={tkHome.feedHeading}>Loading…</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className={tkHome.feedHeading}>
                  {nearby.length} request{nearby.length === 1 ? "" : "s"} near you
                </h2>
                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={feedQuery.isFetching}
                  aria-label="Refresh listings"
                  className="text-tk-muted transition hover:text-tk-forest disabled:opacity-40"
                >
                  <RefreshIcon />
                </button>
              </div>
              <ul className={tkHome.feedList}>
                {nearby.map((req) => (
                  <li key={req.id}>
                    <Link
                      href={`/request/${req.id}`}
                      className={tkHome.requestCard}
                    >
                      <div className={tkHome.requestAvatar} aria-hidden>
                        {req.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={tkHome.requestMetaRow}>
                          <p className={tkHome.requestName}>
                            {req.name}{" "}
                            <span className={tkHome.requestTime}>
                              · {req.postedAgo}
                            </span>
                          </p>
                          <ChevronRightIcon className={tkHome.requestChevron} />
                        </div>
                        <p className={tkHome.requestBody}>{req.task}</p>
                        <div className={tkHome.requestFooter}>
                          <span className={tkHome.requestDistance}>
                            <PinIcon className={tkHome.requestPinIcon} />
                            {req.distance}
                          </span>
                          <span className={tkHome.requestDurationPill}>
                            <ClockIcon className="opacity-90" />~
                            {req.durationMins} min
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
