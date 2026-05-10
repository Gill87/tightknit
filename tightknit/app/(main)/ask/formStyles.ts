/**
 * Tailwind class bundles for Tightknit Ask UI.
 * Color tokens live in app/globals.css (`tk-*` theme colors).
 */

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const tkAsk = {
  shell:
    "flex min-h-full flex-1 flex-col bg-tk-cream pb-10 font-sans text-tk-forest",

  main: "mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8",

  headerRow: "flex items-center gap-3",

  backButton:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-tk-forest transition hover:bg-white active:scale-[0.97]",

  headerTitle: "text-xl font-semibold leading-snug text-tk-forest",

  sectionLabel: "text-sm font-semibold text-tk-forest",

  textarea:
    "min-h-[140px] w-full resize-none rounded-3xl border border-tk-border bg-tk-cream-deep px-4 py-3.5 text-[15px] leading-relaxed text-tk-forest placeholder:text-tk-muted/80 shadow-inner shadow-black/[0.02] outline-none transition focus:border-tk-terracotta/40 focus:ring-2 focus:ring-tk-terracotta/20",

  durationCard:
    "rounded-3xl border border-tk-border bg-tk-card p-4 shadow-sm shadow-black/[0.03]",

  durationHeaderRow: "flex items-center justify-between gap-3",

  durationQuestion: "text-sm font-semibold text-tk-forest",

  durationPill:
    "rounded-full bg-tk-blush px-3 py-1 text-sm font-medium text-tk-terracotta",

  slider: "mt-4 w-full accent-tk-terracotta",

  sliderLabelsRow:
    "mt-2 flex justify-between text-xs font-medium text-tk-muted",

  dateFieldRoot: "relative",

  dateTrigger:
    "flex min-h-[52px] w-full items-center gap-3 rounded-3xl border border-tk-border bg-tk-cream-deep px-4 py-3 text-left shadow-inner shadow-black/[0.02] outline-none transition hover:bg-white focus-visible:border-tk-terracotta/40 focus-visible:ring-2 focus-visible:ring-tk-terracotta/20",

  dateTriggerLabel:
    "flex flex-1 items-center justify-between gap-2 text-[15px] text-tk-forest",

  datePlaceholder: "text-tk-muted",

  calendarPopover:
    "absolute bottom-full left-0 right-0 z-[100] mb-2 rounded-2xl border border-tk-border bg-tk-card p-3 shadow-xl shadow-black/10",

  calendarPopoverHint:
    "mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-tk-muted",

  calendarScroll:
    "max-h-[min(18rem,42vh)] overflow-y-auto overscroll-contain rounded-xl bg-tk-cream-deep/60 px-2 py-2",

  calendarMonthBlock: "pb-4 pt-1 last:pb-1",

  calendarMonthTitle:
    "sticky top-0 z-[1] bg-tk-cream-deep/95 pb-2 pt-1 text-center text-sm font-semibold text-tk-forest backdrop-blur-[2px]",

  calendarWeekdays:
    "mb-1 grid grid-cols-7 gap-0.5 text-[10px] font-medium uppercase tracking-wide text-tk-muted",

  calendarWeekday: "text-center",

  calendarGrid: "grid grid-cols-7 gap-1",

  calendarCellEmpty: "aspect-square min-h-[2rem]",

  calendarDayBtn:
    "aspect-square min-h-[2rem] rounded-xl text-sm font-medium text-tk-forest transition hover:bg-white disabled:pointer-events-none disabled:text-tk-muted/40 disabled:hover:bg-transparent",

  calendarDaySelected:
    "pointer-events-auto bg-tk-terracotta text-white shadow-sm hover:bg-tk-terracotta-hover disabled:text-white disabled:hover:bg-tk-terracotta-hover",

  primaryButton:
    "mt-2 w-full rounded-full bg-tk-cream-deep py-4 text-center text-base font-semibold text-tk-forest shadow-sm transition hover:bg-white active:scale-[0.99]",

  primaryButtonDisabled:
    "cursor-not-allowed opacity-50 hover:bg-tk-cream-deep active:scale-100",

  submitError: "text-center text-sm font-medium text-red-700",
} as const;
