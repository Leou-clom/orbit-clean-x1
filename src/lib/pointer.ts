/** Hay pantalla táctil y el puntero principal es un dedo, no un ratón. */
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
}
