"use client";

import { tkHome } from "./formstyles";
import { useMemo, useState } from "react";
import { ChevronRightIcon, ClockIcon, PinIcon } from "./icons";

type FilterId = "all" | "nearby" | "quick";

type RequestItem = {
  id: string;
  initials: string;
  name: string;
  postedAgo: string;
  task: string;
  distance: string;
  durationMins: number;
  nearbyOnly?: boolean;
};

const STARTING_HOURS = 3;

// Fix me: Update once real posts can be made
const MOCK_REQUESTS: RequestItem[] = [
  {
    id: "1",
    initials: "S",
    name: "Sarah K.",
    postedAgo: "4m ago",
    task: "Need help carrying groceries up 3 flights",
    distance: "2 doors down",
    durationMins: 30,
    nearbyOnly: true,
  },
  {
    id: "2",
    initials: "M",
    name: "Marcus T.",
    postedAgo: "15m ago",
    task: "Can someone walk my dog this afternoon?",
    distance: "0.3 mi away",
    durationMins: 45,
    nearbyOnly: true,
  },
  {
    id: "3",
    initials: "P",
    name: "Priya D.",
    postedAgo: "1h ago",
    task: "Looking for help assembling a bookshelf",
    distance: "0.8 mi away",
    durationMins: 90,
    nearbyOnly: false,
  },
  {
    id: "4",
    initials: "J",
    name: "Jordan L.",
    postedAgo: "2h ago",
    task: "Pick up a package from the lobby",
    distance: "Same building",
    durationMins: 15,
    nearbyOnly: true,
  },
  {
    id: "5",
    initials: "A",
    name: "Alex R.",
    postedAgo: "3h ago",
    task: "Garden weeding — tools provided",
    distance: "1.1 mi away",
    durationMins: 120,
    nearbyOnly: false,
  },
];

export function TightknitHome() {
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return MOCK_REQUESTS;
    if (filter === "nearby") {
      return MOCK_REQUESTS.filter((r) => r.nearbyOnly);
    }
    return MOCK_REQUESTS.filter((r) => r.durationMins < 60);
  }, [filter]);

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: "All" },
    { id: "nearby", label: "Nearby" },
    { id: "quick", label: "Quick (<1 hr)" },
  ];

  return (
    <div className={tkHome.shell}>
      <main className={tkHome.main}>
        <header className={tkHome.headerStack}>
          <p className={tkHome.headerEyebrow}>Tightknit</p>
          <h1 className={tkHome.headerTitle}>Home</h1>
        </header>

        <section
          className={tkHome.balanceSection}
          aria-labelledby="balance-heading"
        >
          <p id="balance-heading" className={tkHome.balanceLabel}>
            Your balance
          </p>
          <p className={tkHome.balanceValue}>{STARTING_HOURS} hours</p>
          <p className={tkHome.balanceHint}>
            You have {STARTING_HOURS} hours to spend or share with neighbors.
          </p>
        </section>

        <section className={tkHome.actionGrid}>
          <button type="button" className={tkHome.askHelpButton}>
            <span className={tkHome.emojiLarge} aria-hidden>
              🙋
            </span>
            <span className={tkHome.askHelpLabel}>Ask for help</span>
          </button>
          <button type="button" className={tkHome.offerHelpButton}>
            <span className={tkHome.emojiLarge} aria-hidden>
              🙌
            </span>
            <span className={tkHome.offerHelpLabel}>Offer help</span>
          </button>
        </section>

        <section aria-label="Filter requests">
          <div className={tkHome.filterRow}>
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={
                    active ? tkHome.filterChipActive : tkHome.filterChipIdle
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className={tkHome.feedSection}>
          <h2 className={tkHome.feedHeading}>
            {filtered.length} request{filtered.length === 1 ? "" : "s"} near you
          </h2>
          <ul className={tkHome.feedList}>
            {filtered.map((req) => (
              <li key={req.id}>
                <button type="button" className={tkHome.requestCard}>
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
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
