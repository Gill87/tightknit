/**
 * Tailwind class bundles for Tightknit You (profile) UI.
 * Color tokens live in app/globals.css (`tk-*` theme colors).
 */

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const tkYou = {
  shell:
    "flex min-h-full flex-1 flex-col bg-tk-cream pb-10 font-sans text-tk-forest",

  main: "mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pt-8",

  topRow: "flex items-start justify-between gap-3",

  pageTitle: "text-2xl font-semibold leading-tight text-tk-forest",

  iconButton:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-tk-forest transition hover:bg-white active:scale-[0.97]",

  profileCard:
    "rounded-3xl border border-tk-border bg-tk-card p-5 shadow-sm shadow-black/[0.03]",

  profileRow: "flex gap-4",

  avatar:
    "flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-tk-cream-deep text-xl font-semibold text-tk-forest",

  profileTextBlock: "min-w-0 flex-1",

  displayName: "text-lg font-semibold leading-snug text-tk-forest",

  handle: "mt-0.5 text-sm text-tk-muted",

  balanceBadge:
    "mt-3 inline-flex items-center gap-1.5 rounded-full bg-tk-blush px-3 py-1.5 text-sm font-medium text-tk-forest",

  sectionHeaderRow: "flex items-baseline justify-between gap-3",

  sectionTitle: "text-base font-semibold text-tk-forest",

  sectionMeta: "text-sm text-tk-muted",

  historyCard:
    "overflow-hidden rounded-3xl border border-tk-border bg-tk-card shadow-sm shadow-black/[0.03]",

  historyRow:
    "flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-tk-cream-deep/40",

  historyRowDivider: "h-px bg-tk-border/80",

  historyEmoji: "mt-0.5 shrink-0 text-lg leading-none",

  historyBody: "min-w-0 flex-1",

  historyTitle: "text-[15px] font-semibold leading-snug text-tk-forest",

  historySub: "mt-0.5 text-sm text-tk-muted",

  historyDeltaPlus: "shrink-0 text-sm font-semibold text-emerald-800",

  historyDeltaMinus: "shrink-0 text-sm font-semibold text-tk-terracotta",

  giftDisclosure:
    "overflow-hidden rounded-3xl border border-tk-border bg-tk-card shadow-sm shadow-black/[0.03]",

  giftDisclosureOpen:
    "border-2 border-tk-terracotta/85 shadow-[0_1px_0_rgba(199,91,66,0.06)]",

  giftTrigger:
    "flex w-full items-center gap-3 p-4 text-left outline-none transition hover:bg-tk-cream-deep/20 focus-visible:ring-2 focus-visible:ring-tk-terracotta/25 active:bg-tk-cream-deep/30",

  giftIconWrap:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tk-cream-deep text-tk-forest transition",

  giftIconWrapOpen: "bg-tk-blush text-tk-terracotta",

  giftTitle: "text-[15px] font-semibold text-tk-forest",

  giftSub: "mt-0.5 block text-sm text-tk-muted",

  giftChevron: "ml-auto shrink-0 text-tk-muted",

  giftPanel:
    "border-t border-tk-border/90 bg-tk-cream-deep/45 px-4 pb-5 pt-4",

  giftFieldLabel: "text-sm font-semibold text-tk-forest",

  giftNeighborGrid: "mt-2 grid grid-cols-2 gap-2",

  giftNeighborChip:
    "flex min-h-[48px] items-center gap-2 rounded-full border px-3 py-2 text-left text-sm font-medium transition active:scale-[0.99]",

  giftNeighborChipOn:
    "border-tk-terracotta/80 bg-tk-blush text-tk-forest shadow-sm",

  giftNeighborChipOff:
    "border-tk-border bg-tk-card text-tk-forest hover:bg-white/80",

  giftNeighborAvatar:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tk-cream-deep text-xs font-semibold text-tk-forest",

  giftNeighborAvatarOn: "bg-white ring-1 ring-tk-terracotta/35",

  giftStepperSection: "mt-5",

  giftStepperRow:
    "mt-2 flex items-center justify-between gap-3 rounded-2xl border border-tk-border/90 bg-tk-card px-3 py-3 shadow-inner shadow-black/[0.02]",

  giftStepperBtn:
    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-lg font-semibold leading-none text-tk-forest transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40",

  giftHourCenter:
    "flex min-w-0 flex-1 items-baseline justify-center gap-1 px-2",

  giftHourValue:
    "text-[26px] font-bold leading-none text-tk-terracotta tabular-nums",

  giftHourWord: "text-sm font-semibold text-tk-forest",

  giftSendBtn:
    "mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-tk-cream-deep py-4 text-base font-semibold text-tk-forest shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50",

  settingsCard:
    "overflow-hidden rounded-3xl border border-tk-border bg-tk-card shadow-sm shadow-black/[0.03]",

  settingsRow:
    "flex items-start gap-3 px-4 py-4",

  settingsRowDivider: "h-px bg-tk-border/80",

  settingsIconWrap:
    "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tk-cream-deep text-tk-forest",

  settingsLabelCol: "min-w-0 flex-1",

  settingsLabel: "text-[15px] font-semibold text-tk-forest",

  radiusBadge:
    "inline-flex shrink-0 rounded-full bg-tk-blush px-2.5 py-1 text-xs font-semibold text-tk-terracotta",

  radiusSlider: "mt-3 w-full accent-tk-terracotta",

  toggleTrackOn:
    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-tk-terracotta transition",

  toggleTrackOff:
    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full bg-tk-border transition",

  toggleKnob:
    "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition",

  toggleKnobOn: "translate-x-6",

  toggleKnobOff: "translate-x-1",

  signOutButton:
    "w-full py-1 text-left text-[15px] font-medium text-tk-muted transition hover:text-tk-forest",
} as const;
