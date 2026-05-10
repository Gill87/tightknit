@AGENTS.md

# Mobile-only app
All UI is mobile-only. Design for small screens (≤ 390px wide):
- Constrain content with `max-w-md mx-auto w-full`
- Touch targets must be ≥ 44px tall
- Use `env(safe-area-inset-*)` for edge padding
- No hover-only interactions — use `active:` states instead
- Use `min-h-full` / `min-h-dvh` — never `min-h-screen`
