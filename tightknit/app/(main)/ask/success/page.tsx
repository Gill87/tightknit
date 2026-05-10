import Link from "next/link";
import { CheckCircleIcon, ChevronLeftIcon } from "../components/icons";
import { cn, tkAsk } from "../formStyles";

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
