/**
 * Tailwind class bundles for Tightknit bottom navigation.
 * Color tokens live in app/globals.css (`tk-*` theme colors).
 */

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export const tkFooter = {
  bar: cn(
    "shrink-0 border-t border-tk-border bg-tk-cream",
    "pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2",
  ),

  list: "mx-auto flex max-w-md items-stretch justify-around px-2",

  link: (active: boolean) =>
    cn(
      "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition-colors",
      active ? "text-tk-terracotta" : "text-tk-muted hover:text-tk-forest/80",
    ),

  icon: (active: boolean) =>
    cn("h-6 w-6", active ? "text-tk-terracotta" : "text-current"),
};
