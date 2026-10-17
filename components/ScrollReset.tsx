"use client";

import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function ScrollReset() {
  const pathname = usePathname();

  useIsoLayoutEffect(() => {
    const smoother = ScrollSmoother.get();
    if (smoother) {
      smoother.scrollTop(0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
