export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

const AVATAR_COLORS = [
  "bg-tk-avatar-warm text-tk-terracotta",
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

export const tkRoom = {
  shell: "flex min-h-full flex-1 flex-col bg-tk-cream",

  headerBar:
    "flex items-center gap-3 px-4 py-3 border-b border-tk-border bg-tk-cream",
  backBtn:
    "flex h-10 w-10 items-center justify-center rounded-full active:bg-tk-cream-deep transition-colors shrink-0",
  headerAvatar:
    "h-9 w-9 rounded-full bg-tk-avatar-warm flex items-center justify-center text-sm font-semibold text-tk-terracotta shrink-0",
  headerInfo: "flex-1 min-w-0",
  headerName: "text-[15px] font-semibold text-tk-forest leading-tight truncate",
  headerSub: "text-xs text-tk-muted truncate",
  markCompleteBtn:
    "shrink-0 rounded-full bg-tk-forest px-3 py-2 text-xs font-semibold text-white active:bg-tk-forest-soft transition-colors disabled:cursor-not-allowed disabled:opacity-45",

  thread: "flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3",

  bubbleWrap: (isSent: boolean) =>
    cn("flex", isSent ? "justify-end" : "justify-start"),
  bubble: (isSent: boolean) =>
    cn(
      "max-w-[78%] rounded-2xl px-4 py-3",
      isSent
        ? "bg-tk-terracotta text-white rounded-tr-sm"
        : "bg-tk-card text-tk-forest border border-tk-border rounded-tl-sm",
    ),
  bubbleText: "text-[15px] leading-snug",
  bubbleMeta: "flex items-center justify-end gap-1 mt-1.5",
  bubbleTime: (isSent: boolean) =>
    cn("text-[11px]", isSent ? "text-white/70" : "text-tk-muted"),

  inputBar:
    "sticky bottom-0 flex items-center gap-3 px-4 py-3 border-t border-tk-border bg-tk-cream pb-[max(0.75rem,env(safe-area-inset-bottom))]",
  inputField:
    "flex-1 rounded-full border border-tk-border bg-tk-cream-deep/50 px-4 py-2.5 text-base text-tk-forest placeholder:text-tk-muted outline-none focus:border-tk-forest/30 transition-colors",
  sendBtn:
    "h-10 w-10 shrink-0 rounded-full bg-tk-forest flex items-center justify-center active:bg-tk-forest-soft transition-colors",
};
