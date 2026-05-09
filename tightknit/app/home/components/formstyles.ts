/**
 * Tailwind class bundles for Tightknit UI.
 * Color tokens live in app/globals.css (`tk-*` theme colors).
 */

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const tkHome = {
  shell:
    "flex min-h-full flex-1 flex-col bg-tk-cream pb-10 font-sans text-tk-forest",

  main: "mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8",

  headerStack: "flex flex-col gap-1",

  headerEyebrow:
    "text-xs font-medium uppercase tracking-[0.12em] text-tk-muted",

  headerTitle: "text-lg font-semibold leading-snug text-tk-forest",

  balanceSection:
    "rounded-3xl bg-tk-forest px-5 py-6 shadow-[var(--tk-shadow-balance)]",

  balanceLabel: "text-sm text-tk-mint/95",

  balanceValue: "mt-1 text-4xl font-semibold tracking-tight text-white",

  balanceHint:
    "mt-2 max-w-[260px] text-sm leading-relaxed text-tk-mint/90",

  actionGrid: "grid grid-cols-2 gap-3",

  askHelpButton:
    "flex aspect-square flex-col items-start justify-end gap-2 rounded-3xl bg-tk-terracotta px-4 pb-4 pt-5 text-left shadow-[var(--tk-shadow-cta)] transition hover:bg-tk-terracotta-hover active:scale-[0.98]",

  askHelpLabel: "text-base font-semibold leading-tight text-white",

  offerHelpButton:
    "flex aspect-square flex-col items-start justify-end gap-2 rounded-3xl border border-tk-border bg-tk-cream-deep px-4 pb-4 pt-5 text-left shadow-sm transition hover:bg-white active:scale-[0.98]",

  offerHelpLabel: "text-base font-semibold leading-tight text-tk-forest",

  filterRow: "flex flex-wrap gap-2",

  filterChipActive:
    "rounded-full bg-tk-chip-active px-4 py-2 text-sm font-medium text-white shadow-sm",

  filterChipIdle:
    "rounded-full border border-tk-border bg-tk-cream-deep/80 px-4 py-2 text-sm font-medium text-tk-forest transition hover:bg-white",

  feedHeading: "text-sm font-medium text-tk-muted",

  feedSection: "flex flex-col gap-3",

  feedList: "flex flex-col gap-3",

  requestCard :
    "group flex w-full items-stretch gap-3 rounded-3xl border border-tk-border/80 bg-tk-card p-4 text-left shadow-sm shadow-black/[0.03] transition hover:border-tk-border hover:shadow-md",

  requestAvatar:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tk-cream-deep text-base font-semibold text-tk-forest-soft",

  requestMetaRow: "flex items-start justify-between gap-2",

  requestName: "truncate text-sm font-semibold text-tk-forest",

  requestTime: "font-normal text-tk-muted",

  requestChevron:
    "mt-0.5 shrink-0 text-tk-muted transition group-hover:text-tk-forest",

  requestBody: "mt-1 text-[15px] leading-snug text-tk-forest",

  requestFooter: "mt-3 flex flex-wrap items-center gap-2",

  requestDistance:
    "inline-flex items-center gap-1 text-xs text-tk-muted",

  requestPinIcon: "text-tk-muted",

  requestDurationPill:
    "inline-flex items-center gap-1 rounded-full bg-tk-blush px-2.5 py-1 text-xs font-medium text-tk-terracotta",

  emojiLarge: "text-2xl",
} as const;
