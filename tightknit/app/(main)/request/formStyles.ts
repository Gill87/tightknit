/**
 * Tailwind class bundles for the Tightknit Request detail UI.
 * Color tokens live in app/globals.css (`tk-*` theme colors).
 */

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const tkRequest = {
  shell:
    "flex min-h-full flex-1 flex-col bg-tk-cream pb-10 font-sans text-tk-forest",

  main: "mx-auto flex w-full max-w-md flex-1 flex-col gap-5 px-5 pt-8",

  headerRow: "flex items-center gap-3",

  backButton:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-tk-forest transition hover:bg-white active:scale-[0.97]",

  headerTitle: "text-xl font-semibold leading-snug text-tk-forest",

  profileCard:
    "flex items-center gap-3 rounded-3xl bg-tk-cream-deep/70 px-4 py-3.5",

  profileAvatar:
    "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tk-cream-deep text-base font-semibold text-tk-forest-soft",

  profileBody: "min-w-0 flex-1",

  profileTopRow: "flex items-center gap-2",

  profileName: "text-[15px] font-semibold text-tk-forest",

  profileRating:
    "inline-flex items-center gap-1 text-xs font-medium text-tk-forest",

  profileStarIcon: "text-tk-terracotta",

  profileMetaRow:
    "mt-0.5 flex items-center gap-1.5 text-xs text-tk-muted",

  profileMetaIcon: "text-tk-muted",

  profileMetaDot: "text-tk-muted/70",

  descriptionCard:
    "rounded-3xl bg-tk-cream-deep/70 px-4 py-4",

  descriptionText:
    "text-[16px] leading-relaxed text-tk-forest",

  pillRow: "flex flex-wrap gap-2",

  pill:
    "inline-flex items-center gap-1.5 rounded-full border border-tk-border bg-tk-card px-3 py-1.5 text-xs font-medium text-tk-forest",

  pillIconClock: "text-tk-muted",

  pillIconPin: "text-tk-terracotta",

  pillIconCalendar: "text-tk-muted",

  earnCard:
    "flex items-start gap-3 rounded-3xl bg-tk-cream-deep/70 px-4 py-4",

  earnIconWrap:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tk-cream-deep text-tk-forest",

  earnTitle: "text-[15px] font-semibold text-tk-forest",

  earnHint: "mt-0.5 text-[13px] leading-snug text-tk-muted",

  primaryCta:
    "mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-tk-terracotta px-5 py-4 text-base font-semibold text-white shadow-[var(--tk-shadow-cta)] transition hover:bg-tk-terracotta-hover active:scale-[0.99]",

  secondaryCta:
    "inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-tk-forest bg-transparent px-5 py-3.5 text-base font-semibold text-tk-forest transition hover:bg-tk-cream-deep active:scale-[0.99]",

  emojiInline: "text-lg leading-none",
} as const;
