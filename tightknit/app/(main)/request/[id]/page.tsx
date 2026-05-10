"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { getRequestById } from "@/app/(main)/_data/requests";
import {
  CalendarIcon,
  ChatIcon,
  ChevronLeftIcon,
  ClockIcon,
  PinIcon,
  StarIcon,
} from "../components/icons";
import { tkRequest } from "../formStyles";

function formatHours(totalMins: number): string {
  const hours = totalMins / 60;
  if (Number.isInteger(hours)) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours.toFixed(1)} hours`;
}

function formatMinutes(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return h === 1 ? "1 hr" : `${h} hrs`;
  return `${h} hr ${m} min`;
}

export default function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const req = getRequestById(id);
  if (!req) notFound();

  const firstName = req.name.split(" ")[0]?.replace(/\.$/, "") ?? req.name;

  return (
    <div className={tkRequest.shell}>
      <main className={tkRequest.main}>
        <header className={tkRequest.headerRow}>
          <Link
            href="/home"
            className={tkRequest.backButton}
            aria-label="Back to home"
          >
            <ChevronLeftIcon className="text-tk-forest" />
          </Link>
          <h1 className={tkRequest.headerTitle}>Request</h1>
        </header>

        <section className={tkRequest.profileCard} aria-label="Requester">
          <div className={tkRequest.profileAvatar} aria-hidden>
            {req.initials}
          </div>
          <div className={tkRequest.profileBody}>
            <div className={tkRequest.profileTopRow}>
              <p className={tkRequest.profileName}>{req.name}</p>
              <span className={tkRequest.profileRating}>
                <StarIcon className={tkRequest.profileStarIcon} />
                {req.rating.toFixed(1)}
              </span>
            </div>
            <div className={tkRequest.profileMetaRow}>
              <PinIcon className={tkRequest.profileMetaIcon} />
              <span>{req.distance}</span>
              <span className={tkRequest.profileMetaDot} aria-hidden>
                ·
              </span>
              <span>{req.postedAgo}</span>
            </div>
          </div>
        </section>

        <section
          className={tkRequest.descriptionCard}
          aria-label="Request details"
        >
          <p className={tkRequest.descriptionText}>{req.description}</p>
        </section>

        <section className={tkRequest.pillRow} aria-label="Request summary">
          <span className={tkRequest.pill}>
            <ClockIcon className={tkRequest.pillIconClock} />~
            {formatMinutes(req.durationMins)}
          </span>
          <span className={tkRequest.pill}>
            <PinIcon className={tkRequest.pillIconPin} />
            {req.address}
          </span>
          <span className={tkRequest.pill}>
            <CalendarIcon className={tkRequest.pillIconCalendar} />
            {req.scheduledFor}
          </span>
        </section>

        <section className={tkRequest.earnCard} aria-label="Earnings">
          <span className={tkRequest.earnIconWrap} aria-hidden>
            <ClockIcon className="text-tk-forest" />
          </span>
          <div className="min-w-0 flex-1">
            <p className={tkRequest.earnTitle}>
              Earn ~{formatHours(req.durationMins)}
            </p>
            <p className={tkRequest.earnHint}>
              Added to your balance when {firstName} marks it complete
            </p>
          </div>
        </section>

        <button type="button" className={tkRequest.primaryCta}>
          <span>I can help</span>
          <span className={tkRequest.emojiInline} aria-hidden>
            🙌
          </span>
        </button>

        <button type="button" className={tkRequest.secondaryCta}>
          <ChatIcon />
          <span>Message {firstName}</span>
        </button>
      </main>
    </div>
  );
}
