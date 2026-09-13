import type Lenis from 'lenis';

/** Module-level handle to the active Lenis instance (V2 only, set by
 *  components/SmoothScroll.tsx) so anchor-click handlers elsewhere (Nav)
 *  can route their jumps through it instead of native scrollTo/scrollIntoView
 *  — avoids two competing smoothing loops fighting over scroll position. */
export const lenisRef: { current: Lenis | null } = { current: null };
