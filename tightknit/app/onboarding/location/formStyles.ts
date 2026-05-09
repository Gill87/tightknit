// Page layout
export const page = 'min-h-[100svh] bg-[var(--color-bg)] flex flex-col'
export const pageInner = 'max-w-md mx-auto w-full flex flex-col flex-1 px-5 pt-5 pb-8 gap-6'

// Progress bar
export const progressBar = 'flex gap-1.5 w-full'
export const progressSegmentActive = 'h-1 flex-1 rounded-full bg-[var(--color-primary)]'
export const progressSegmentInactive = 'h-1 flex-1 rounded-full bg-[var(--tk-border)]'

// Header
export const heading = 'text-[2rem] font-bold text-[var(--color-text)] leading-tight mt-2'
export const subtitle = 'text-[15px] text-[var(--color-muted)] -mt-2'

// Map card
export const mapCard = 'rounded-2xl overflow-hidden relative h-[300px] w-full'
export const mapSvg = 'absolute inset-0 w-full h-full'

// Location pill (inside map card)
export const locationPillWrapper = 'absolute bottom-4 left-1/2 -translate-x-1/2'
export const locationPill = 'flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm text-sm font-medium text-[var(--color-text)] whitespace-nowrap'
export const locationDot = 'w-2.5 h-2.5 rounded-full bg-[var(--color-primary)] shrink-0'
export const locationPending = 'text-[var(--color-muted)] italic'

// Reach card
export const reachCard = 'bg-white rounded-2xl px-5 py-5 flex flex-col gap-3 shadow-sm'
export const reachLabel = 'text-[15px] font-semibold text-[var(--color-text)]'
export const distancePill = 'w-full text-center py-3 rounded-2xl bg-[var(--color-surface)] text-[var(--color-primary)] font-medium text-[15px]'
export const sliderWrapper = 'flex flex-col gap-1.5 mt-1'
export const sliderInput = [
  'w-full appearance-none cursor-pointer h-[3px] rounded-full',
  'bg-[var(--color-text)]',
  '[&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:w-5',
  '[&::-webkit-slider-thumb]:h-5',
  '[&::-webkit-slider-thumb]:rounded-full',
  '[&::-webkit-slider-thumb]:bg-[var(--color-primary)]',
  '[&::-webkit-slider-thumb]:border-0',
  '[&::-webkit-slider-thumb]:cursor-pointer',
  '[&::-moz-range-thumb]:w-5',
  '[&::-moz-range-thumb]:h-5',
  '[&::-moz-range-thumb]:rounded-full',
  '[&::-moz-range-thumb]:bg-[var(--color-primary)]',
  '[&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:cursor-pointer',
  '[&::-moz-range-track]:bg-[var(--color-text)]',
  '[&::-moz-range-track]:h-[3px]',
  '[&::-moz-range-track]:rounded-full',
].join(' ')
export const sliderMinMax = 'flex justify-between text-xs text-[var(--color-muted)]'

// Denied state
export const deniedWrapper = 'flex flex-col gap-4'
export const deniedText = 'text-[15px] text-[var(--color-muted)] leading-relaxed'
export const grantButton = 'w-full py-4 rounded-full bg-[var(--color-primary)] text-white font-semibold text-base active:scale-[0.98] transition-transform cursor-pointer'

// Next button
export const nextButton = 'w-full py-4 rounded-full bg-[var(--color-primary)] text-white font-semibold text-base active:scale-[0.98] transition-transform cursor-pointer'
