"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DatePickerField } from "./components/DatePickerField";
import { ChevronLeftIcon } from "./components/icons";
import { cn, tkAsk } from "./formStyles";

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

export default function AskPage() {
  const [need, setNeed] = useState("");
  const [durationMins, setDurationMins] = useState(60);
  const [neededDay, setNeededDay] = useState<string>(() => todayIsoDate());

  const canSubmit = need.trim().length > 0 && neededDay.length > 0;

  const durationLabel = useMemo(
    () => formatDurationLabel(durationMins),
    [durationMins],
  );

  return (
    <div className={tkAsk.shell}>
      <main className={tkAsk.main}>
        <header className={tkAsk.headerRow}>
          <Link
            href="/home"
            className={tkAsk.backButton}
            aria-label="Back to home"
          >
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
            max={DURATION_MAX}
            step={DURATION_STEP}
            value={durationMins}
            onChange={(e) => setDurationMins(Number(e.target.value))}
            aria-valuemin={DURATION_MIN}
            aria-valuemax={DURATION_MAX}
            aria-valuenow={durationMins}
            aria-label="Estimated duration"
          />
          <div className={tkAsk.sliderLabelsRow}>
            <span>30 min</span>
            <span>4 hours</span>
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="when-label">
          <p id="when-label" className={tkAsk.sectionLabel}>
            When do you need it?
          </p>
          <DatePickerField
            id="needed-day"
            value={neededDay}
            onChange={setNeededDay}
          />
        </section>

        <button
          type="button"
          disabled={!canSubmit}
          className={cn(tkAsk.primaryButton, !canSubmit && tkAsk.primaryButtonDisabled)}
        >
          Post your request
        </button>
      </main>
    </div>
  );
}
