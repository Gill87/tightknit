import { cn } from "../formStyles";

export { cn };

export const tkMyPosts = {
  card:
    "rounded-3xl border border-tk-border bg-tk-card p-4 shadow-sm shadow-black/[0.03]",

  cardTitle:
    "text-[15px] font-semibold leading-snug text-tk-forest line-clamp-3",

  metaRow: "mt-2 flex flex-wrap items-center gap-2 text-xs text-tk-muted",

  badge:
    "inline-flex rounded-full bg-tk-cream-deep px-2 py-0.5 font-medium text-tk-forest",

  badgeClaimed: "bg-tk-blush text-tk-terracotta",

  badgePending: "bg-amber-50 text-amber-900",

  badgeDone: "bg-emerald-50 text-emerald-900",

  actionsRow: "mt-3 flex flex-wrap items-center gap-2 border-t border-tk-border/80 pt-3",

  iconBtn:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-tk-forest transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35",

  iconBtnDanger:
    "border-red-200 text-red-800 hover:bg-red-50 disabled:opacity-35",

  editPanel:
    "mt-3 rounded-2xl border border-tk-border/90 bg-tk-cream-deep/50 p-3",

  editActions: "mt-3 flex justify-end gap-2",

  tinyBtn:
    "rounded-full px-4 py-2 text-sm font-semibold transition",

  tinyBtnPrimary:
    "bg-tk-terracotta text-white hover:bg-tk-terracotta-hover",

  tinyBtnGhost: "border border-tk-border bg-tk-card text-tk-forest hover:bg-white",

  emptyText: "px-4 py-10 text-center text-sm text-tk-muted",

  errorText: "text-sm text-red-700",

  headerRow: "flex items-center gap-3",

  backButton:
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-tk-border bg-tk-cream-deep text-tk-forest transition hover:bg-white active:scale-[0.97]",

  headerTitle: "text-xl font-semibold leading-snug text-tk-forest",
} as const;
