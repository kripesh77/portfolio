"use client";

import { useEffect, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function LenisGsapSync() {
  // Lenis smooth-scrolls .main-scroll (html/body are overflow:hidden in
  // globals.css), so the window never scrolls and triggers bound to the
  // default scroller (window) can never fire.
  //
  // The default must be registered BEFORE any ScrollTrigger exists, because
  // GSAP resolves vars.scroller exactly once (ScrollTrigger.init) and
  // refreshing never rebinds it. This component renders before <main>{children}
  // </main>, so its layout effect runs before page effects (useGSAP, ...)
  // create their triggers — and by layout-effect time the DOM is committed.
  //
  // Note the value is the ELEMENT, not the ".main-scroll" selector: inside a
  // scoped useGSAP context, gsap resolves strings against the scope (not the
  // document), and .main-scroll is an ancestor of every scope — a scoped
  // string lookup would come back undefined. document.querySelector here is
  // native (context-unaware), and elements are passed through untouched.
  useIsomorphicLayoutEffect(() => {
    const scroller = document.querySelector(".main-scroll");
    if (scroller) ScrollTrigger.defaults({ scroller });
  }, []);

  // LenisGsapSync renders inside <ReactLenis>, so this comes from context:
  // undefined on the first pass (ReactLenis builds the instance in its own
  // effect, which runs after children's effects bail), then the live instance
  // — at which point this effect re-runs and wires everything up.
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    // Official Lenis <-> ScrollTrigger hookup (lenis README, "GSAP
    // ScrollTrigger" section): update triggers on every lenis scroll, drive
    // lenis from the gsap ticker so both share one clock, and disable gsap's
    // lag smoothing so it never delays scroll-linked animations.
    const onScroll = () => ScrollTrigger.update();
    const update = (time: number) => lenis.raf(time * 1000);

    lenis.on("scroll", onScroll);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    // Re-measure any triggers created before the instance existed.
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return null;
}