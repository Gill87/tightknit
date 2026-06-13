"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircleIcon, ChevronLeftIcon } from "../components/icons";
import { cn, tkAsk } from "../formStyles";

function formatHoursLabel(totalMins: number): string {
  if (totalMins < 60) return `${totalMins} min`;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (m === 0) return h === 1 ? "1 hour" : `${h} hours`;
  const hourPart = h === 1 ? "1 hr" : `${h} hrs`;
  return `${hourPart} ${m} min`;
}

function EscrowNote() {
  const searchParams = useSearchParams();
  const mins = Number(searchParams.get("mins") ?? "0");
  if (!mins || !Number.isFinite(mins) || mins <= 0) return null;
  return (
    <p className={tkAsk.successEscrowNote}>
      We will deduct {formatHoursLabel(mins)} from your balance. You can have
      these hours refunded if you delete the post.
    </p>
  );
}

export default function AskSuccessPage() {
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
          <h1 className={tkAsk.headerTitle}>Request posted</h1>
        </header>

        <div className="flex flex-col items-center gap-4 pt-2">
          <div className={tkAsk.successIconWrap}>
            <CheckCircleIcon className="h-14 w-14" />
          </div>
          <p className={tkAsk.successBody}>
            Your ask is live for neighbors nearby. Check back on the home feed
            to see responses and updates.
          </p>
          <Suspense>
            <EscrowNote />
          </Suspense>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <Link
            href="/home"
            className={cn(tkAsk.primaryButton, "mt-0 text-center")}
          >
            Back to home
          </Link>
          <Link href="/ask" className={tkAsk.secondaryLink}>
            Post another request
          </Link>
        </div>
      </main>
    </div>
  );
}
