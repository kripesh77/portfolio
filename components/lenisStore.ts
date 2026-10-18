import type Lenis from "lenis";

/**
 * Module-level handle to the root Lenis instance created in app/layout.tsx.
 * Needed because <Navbar /> renders outside the <ReactLenis> subtree, so the
 * lenis/react context (useLenis) isn't available there.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
