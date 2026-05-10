export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const AVATAR_COLORS = [
  "bg-[#e8d5c4] text-tk-terracotta",
  "bg-tk-mint text-tk-forest",
  "bg-tk-cream-deep text-tk-muted",
];

export const tkMessages = {
  shell: "flex min-h-full flex-1 flex-col bg-tk-cream font-sans text-tk-forest",
  inner: "mx-auto flex w-full max-w-md flex-1 flex-col px-5 pt-8",
  header: "text-2xl font-bold text-tk-forest mb-4",
  list: "flex flex-col divide-y divide-tk-border",

  row: "flex w-full items-center gap-4 py-4 active:bg-tk-cream-deep/40 transition-colors",
  avatarWrap: "relative shrink-0",
  avatar: (colorIndex: number) =>
    cn(
      "h-12 w-12 rounded-full flex items-center justify-center text-base font-semibold",
      AVATAR_COLORS[colorIndex % AVATAR_COLORS.length],
    ),
  badge:
    "absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-tk-terracotta text-white text-[10px] font-bold flex items-center justify-center",
  body: "flex-1 min-w-0",
  nameRow: "flex items-baseline justify-between gap-2",
  name: "text-[15px] font-semibold text-tk-forest truncate",
  time: "text-xs text-tk-muted shrink-0",
  preview: "text-sm text-tk-muted truncate mt-0.5",
};
