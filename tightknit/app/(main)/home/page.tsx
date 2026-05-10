"use client";

import Link from "next/link";
import { tkHome } from "./formStyles";
import { useMemo, useState } from "react";
import { ChevronRightIcon, ClockIcon, PinIcon } from "./components/icons";
import { MOCK_REQUESTS } from "@/app/(main)/_data/requests";

type FilterId = "all" | "nearby" | "quick";

const STARTING_HOURS = 3;

export default function HomePage() {
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
          <Link href="/ask" className={tkHome.askHelpButton}>
            <span className={tkHome.emojiLarge} aria-hidden>
              🙋
            </span>
            <span className={tkHome.askHelpLabel}>Ask for help</span>
          </Link>
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
        </section>
      </main>
    </div>
  );
}
