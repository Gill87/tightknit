"use client";

import { useMemo, useState } from "react";
import {
  ArrowRightIcon,
  BellIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  GearIcon,
  GiftIcon,
  LogOutIcon,
  PinIcon,
} from "./components/icons";
import { cn, tkYou } from "./formStyles";

const EXCHANGE_COUNT = 5;
const BALANCE_HOURS = 3;
const BALANCE_MINUTES = BALANCE_HOURS * 60;
const GIFT_STEP_MINUTES = 30;

type HistoryEntry = {
  id: string;
  emoji: string;
  title: string;
  detail: string;
  /** Signed hours; positive = received, negative = spent */
  deltaHours: number;
};

const MOCK_HISTORY: HistoryEntry[] = [
  {
    id: "1",
    emoji: "👏",
    title: "Carried groceries up",
    detail: "with Sarah K. · Today",
    deltaHours: 0.5,
  },
  {
    id: "2",
    emoji: "🤷",
    title: "Fixed my leaky faucet",
    detail: "with Marcus T. · Yesterday",
    deltaHours: -1,
  },
  {
    id: "3",
    emoji: "👏",
    title: "Helped with shelf setup",
    detail: "with Priya D. · Mon",
    deltaHours: 2,
  },
  {
    id: "4",
    emoji: "🤷",
    title: "Baked bread for me",
    detail: "with Yuki O. · Last week",
    deltaHours: -1,
  },
];

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

const RADIUS_MIN = 0.25;
const RADIUS_MAX = 5;
const RADIUS_STEP = 0.25;

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
  const [radiusMiles, setRadiusMiles] = useState(0.5);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftNeighborId, setGiftNeighborId] = useState(MOCK_NEIGHBORS[0]!.id);
  const [giftMinutes, setGiftMinutes] = useState(60);

  const radiusLabel = useMemo(
    () => formatRadiusMi(radiusMiles),
    [radiusMiles],
  );

  const giftCenter = useMemo(
    () => giftStepCenterParts(giftMinutes),
    [giftMinutes],
  );

  const canSendGift =
    giftMinutes >= GIFT_STEP_MINUTES && giftMinutes <= BALANCE_MINUTES;

  const bumpGiftMinutes = (delta: number) => {
    setGiftMinutes((m) => {
      const next = m + delta;
      return Math.min(BALANCE_MINUTES, Math.max(GIFT_STEP_MINUTES, next));
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
              A
            </div>
            <div className={tkYou.profileTextBlock}>
              <p id="profile-name" className={tkYou.displayName}>
                Alex Rivera
              </p>
              <p className={tkYou.handle}>@alexrivera</p>
              <p className={tkYou.balanceBadge}>
                <ClockIcon className="text-tk-terracotta" />
                {BALANCE_HOURS} hours
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
              {EXCHANGE_COUNT} exchanges
            </p>
          </div>
          <div className={tkYou.historyCard}>
            <ul className="divide-y divide-tk-border/80">
              {MOCK_HISTORY.map((row) => (
                <li key={row.id}>
                  <div className={tkYou.historyRow}>
                    <span className={tkYou.historyEmoji} aria-hidden>
                      {row.emoji}
                    </span>
                    <div className={tkYou.historyBody}>
                      <p className={tkYou.historyTitle}>{row.title}</p>
                      <p className={tkYou.historySub}>{row.detail}</p>
                    </div>
                    <p
                      className={
                        row.deltaHours >= 0
                          ? tkYou.historyDeltaPlus
                          : tkYou.historyDeltaMinus
                      }
                    >
                      {formatDeltaHours(row.deltaHours)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
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
                      disabled={giftMinutes >= BALANCE_MINUTES}
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
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  aria-label="Neighborhood radius"
                />
              </div>
            </div>

            <div className={tkYou.settingsRowDivider} />

            <div className={tkYou.settingsRow}>
              <span className={tkYou.settingsIconWrap}>
                <BellIcon />
              </span>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <p className={tkYou.settingsLabel}>Notifications</p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notificationsOn}
                  onClick={() => setNotificationsOn((v) => !v)}
                  className={
                    notificationsOn ? tkYou.toggleTrackOn : tkYou.toggleTrackOff
                  }
                >
                  <span
                    className={cn(
                      tkYou.toggleKnob,
                      notificationsOn ? tkYou.toggleKnobOn : tkYou.toggleKnobOff,
                    )}
                  />
                </button>
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
