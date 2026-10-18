"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

// ─── types ────────────────────────────────────────────────────────────────

type ScrollFunc = {
  (): number;
  (position: number): void;
};

type TweenWithResetTo = gsap.core.Tween & {
  resetTo?: (
    property: string,
    endValue: number | string,
    startValue: number | string,
    startIsRelative?: boolean,
  ) => gsap.core.Tween;
};

function resetTweenTo(
  tween: gsap.core.Tween,
  prop: string,
  endValue: number,
  startValue: number,
  startIsRelative: boolean,
): void {
  const t = tween as TweenWithResetTo;
  if (typeof t.resetTo === "function") {
    t.resetTo(prop, endValue, startValue, startIsRelative);
    return;
  }
  const target = tween.targets()[0] as Element;
  const current = parseFloat(String(gsap.getProperty(target, prop))) || 0;
  const start = startIsRelative ? current + startValue : startValue;
  const vars = tween.vars as Record<string, unknown>;
  vars[prop] = endValue;
  vars.startAt = { [prop]: start };
  tween.invalidate();
  tween.restart();
}

// Matches ScrollSmoother's `effectValueGetter` parsing.
type ParsedSpeed = {
  ratio: number;
  clamped: boolean;
};

function parseSpeed(attr: string | undefined): ParsedSpeed {
  if (attr === undefined) return { ratio: 1, clamped: false };
  const trimmed = attr.trim();
  if (trimmed.startsWith("clamp(") && trimmed.endsWith(")")) {
    const inner = trimmed.slice(6, -1).trim();
    const v = parseFloat(inner);
    return { ratio: !Number.isFinite(v) || v === 0 ? 1 : v, clamped: true };
  }
  const v = parseFloat(trimmed);
  return { ratio: !Number.isFinite(v) || v === 0 ? 1 : v, clamped: false };
}

// ─── component ────────────────────────────────────────────────────────────

export default function DataEffects() {
  const pathname = usePathname();

  useEffect(() => {
    const scrollerEl = document.querySelector(
      ".main-scroll",
    ) as HTMLElement | null;
    if (!scrollerEl) return;

    const scrollFn = ScrollTrigger.getScrollFunc(
      scrollerEl,
    ) as unknown as ScrollFunc;
    const readScroll = (): number => {
      const v = scrollFn();
      return typeof v === "number" && !Number.isNaN(v) ? v : 0;
    };

    const triggers: ScrollTrigger[] = [];
    const tweens: gsap.core.Tween[] = [];

    // ── shared per-frame scroll delta ──
    let lastScroll = readScroll();
    let lastFrame = -1;
    let frameDelta = 0;
    const getFrameDelta = (): number => {
      const frame = gsap.ticker.frame;
      if (lastFrame !== frame) {
        const s = readScroll();
        frameDelta = s - lastScroll;
        lastScroll = s;
        lastFrame = frame;
      }
      return frameDelta;
    };

    // ── startup grace period (snap on load, no visible catch-up) ──
    let startupPhase = true;
    const startupCall = gsap.delayedCall(0.5, () => {
      startupPhase = false;
    });

    const build = () => {
      document
        .querySelectorAll<HTMLElement>("[data-speed], [data-lag]")
        .forEach((el) => {
          const speedAttr = el.dataset.speed;
          const lagAttr = el.dataset.lag;
          if (speedAttr === undefined && lagAttr === undefined) return;

          const { ratio, clamped } = parseSpeed(speedAttr);
          const lag = lagAttr !== undefined ? parseFloat(lagAttr) || 0 : 0;
          if (ratio === 1 && !lag) return;

          const startY = 0;
          let change = 0;
          let progressOffset = 0.5;

          let scrub: gsap.core.Tween | null = null;
          if (lag > 0) {
            scrub = gsap.to(el, {
              y: "+=0",
              duration: lag,
              ease: "expo",
              overwrite: false,
            });
            tweens.push(scrub);
          }

          const st = ScrollTrigger.create({
            trigger: el,
            start: clamped ? "clamp(top bottom)" : "top bottom",
            end: clamped
              ? () => {
                  // Measure the element's natural position (temporarily
                  // resetting y so any current parallax offset doesn't bias
                  // the measurement).
                  const prevY = Number(gsap.getProperty(el, "y")) || 0;
                  gsap.set(el, { y: 0 });
                  const rect = el.getBoundingClientRect();
                  gsap.set(el, { y: prevY });

                  const scroll = readScroll();
                  const vh = window.innerHeight;
                  const naturalStart = scroll + rect.top - vh;
                  const naturalEnd = scroll + rect.bottom;
                  const maxScroll = ScrollTrigger.maxScroll(scrollerEl);

                  // If the trigger start would be clamped (element already
                  // partly in view at the top of the page), extend the end
                  // so the element still travels the full visible distance
                  // at its parallax rate. Matches ScrollSmoother's
                  // `end = st.end / st.ratio` in onRefresh.
                  if (naturalStart < -1 && ratio > 0) {
                    return Math.min(naturalEnd / ratio, maxScroll);
                  }
                  return Math.min(naturalEnd, maxScroll);
                }
              : "bottom top",
            scroller: ".main-scroll",
            invalidateOnRefresh: true,
            onRefresh: (self) => {
              const maxScroll = ScrollTrigger.maxScroll(scrollerEl);
              const startClamped = clamped && self.start <= 0;
              const endClamped = clamped && self.end >= maxScroll - 0.5;

              change = (self.end - self.start) * (1 - ratio);
              // Start-clamp takes priority, same as ScrollSmoother.
              progressOffset = startClamped ? 0 : endClamped ? 1 : 0.5;
            },
            onUpdate: (self) => {
              const y =
                Math.round(
                  (startY + change * (self.progress - progressOffset)) * 100000,
                ) / 100000;

              if (scrub) {
                resetTweenTo(scrub, "y", y, getFrameDelta(), true);
                if (startupPhase) scrub.progress(1);
              } else {
                gsap.set(el, { y });
              }
            },
          });

          triggers.push(st);
        });

      ScrollTrigger.refresh();
    };

    const raf = requestAnimationFrame(build);

    return () => {
      cancelAnimationFrame(raf);
      startupCall.kill();
      tweens.forEach((t) => t.kill());
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}
