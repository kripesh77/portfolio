"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, RefObject, useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

CustomEase.create("customEase", "1, .01, .43, .95");

type TriggerType = string | HTMLElement | RefObject<HTMLElement | null>;

type RevealTarget = HTMLElement | HTMLElement[] | NodeListOf<Element>;

type TimingOptions = {
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
};

type ScrollOptions = TimingOptions & {
  start?: string;
  end?: string;
  toggleActions?: string;
  trigger?: TriggerType;
};

// Resolve custom trigger or fall back to target
const resolveTrigger = (
  trigger?: TriggerType,
  fallback?: HTMLElement | null,
) => {
  if (!trigger) return fallback;

  if (typeof trigger === "string" || trigger instanceof HTMLElement) {
    return trigger;
  }

  return trigger.current ?? fallback;
};

/* =========================================================
   REVEAL SPECS

   slideUp:
   - Splits text into words
   - Animates word children
   - Uses stagger

   slideIn:
   - Does NOT split into characters
   - Animates the entire element
   - No stagger
========================================================= */

const SPECS = {
  slideUp: {
    mask: "words",
    from: { yPercent: 100 },
    targets: (word: Element) => Array.from(word.children),
  },
  slideIn: {
    mask: "chars",
    from: { xPercent: 100 },
    targets: (word: Element) =>
      Array.from(word.querySelectorAll<HTMLElement>(".char")),
  },
} as const;

type RevealName = keyof typeof SPECS;

/* =========================================================
   SHARED REVEAL ENGINE
========================================================= */

const buildReveal = (
  target: RevealTarget,
  name: RevealName,
  {
    duration = 1,
    stagger = 0.05,
    delay = 0,
    ease = "customEase",
  }: TimingOptions = {},
) => {
  const spec = SPECS[name];

  const split = SplitText.create(target, {
    type: "chars, words, lines",
    mask: spec.mask,
    charsClass: "char",
  });

  gsap.set(target, { visibility: "visible" });

  const addTweens = (tl: gsap.core.Timeline) => {
    if (name === "slideIn") {
      tl.from(
        split.chars,
        {
          ...spec.from,
          duration,
          delay,
          ease,
        },
        0,
      );

      return;
    }

    split.words.forEach((word) => {
      tl.from(
        spec.targets(word),
        {
          ...spec.from,
          stagger,
          delay,
          duration,
          ease,
        },
        0,
      );
    });
  };

  return { split, addTweens };
};

/* =========================================================
   SCROLL-TRIGGERED REVEAL
========================================================= */

export function useRevealOnScroll(
  targetRef: RefObject<RevealTarget | null>,
  name: RevealName,
  options: ScrollOptions = {},
): SplitText | null {
  const [splitInstance, setSplitInstance] = useState<SplitText | null>(null);

  const {
    trigger,
    start = "top bottom",
    end = "bottom top",
    toggleActions = "play reverse play reverse",
  } = options;

  useGSAP(
    () => {
      if (!targetRef.current) return;

      const triggerElement = resolveTrigger(
        trigger,
        targetRef.current as HTMLElement,
      );

      const { split, addTweens } = buildReveal(
        targetRef.current,
        name,
        options,
      );

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start,
          end,
          toggleActions,
        },
        ...options,
      });

      addTweens(tl);

      setSplitInstance(split);

      return () => {
        split?.revert();
      };
    },
    { dependencies: [targetRef] },
  );

  return splitInstance;
}

/* =========================================================
   TIMELINE-ATTACHED REVEAL

   The caller owns the timeline.
========================================================= */

export function attachReveal(
  tl: gsap.core.Timeline,
  target: RevealTarget,
  name: RevealName,
  options: TimingOptions = {},
): SplitText | null {
  const { split, addTweens } = buildReveal(target, name, options);

  addTweens(tl);

  return split;
}

/* =========================================================
   DIRECT REVEAL

   Plays immediately.
   Supports reverse and revert.
========================================================= */

export function playReveal(
  target: RevealTarget,
  name: RevealName,
  options: TimingOptions = {},
) {
  const { split, addTweens } = buildReveal(target, name, options);

  const timeline = gsap.timeline();

  addTweens(timeline);

  return {
    split,
    timeline,

    reverse: () => timeline.reverse(),

    revert: () => {
      split?.revert();
      timeline.kill();
    },
  };
}

/* =========================================================
   DECLARATIVE REVEALS

   Usage:

   <div className="text-animation">
     <div className="slide-up">Slide up text</div>
     <div className="slide-in">Slide in text</div>
   </div>

   Call once per page.
========================================================= */

const REVEAL_BY_CLASS = {
  "slide-up": "slideUp",
  "slide-in": "slideIn",
} as const satisfies Record<string, RevealName>;

export function useTextAnimations(
  options: Omit<ScrollOptions, "trigger"> = {},
) {
  const pathname = usePathname();

  const frameRef = useRef<number | null>(null);

  const {
    start = "top bottom",
    end = "bottom top",
    toggleActions = "play reverse play reverse",
  } = options;

  useGSAP(
    () => {
      const splits: SplitText[] = [];

      const initialize = () => {
        document
          .querySelectorAll<HTMLElement>(".text-animation")
          .forEach((container) => {
            container
              .querySelectorAll<HTMLElement>(".slide-up, .slide-in")
              .forEach((el) => {
                const cls = (
                  Object.keys(REVEAL_BY_CLASS) as Array<
                    keyof typeof REVEAL_BY_CLASS
                  >
                ).find((c) => el.classList.contains(c));

                if (!cls) return;

                const { split, addTweens } = buildReveal(
                  el,
                  REVEAL_BY_CLASS[cls],
                  options,
                );

                const tl = gsap.timeline({
                  scrollTrigger: {
                    trigger: container,
                    start,
                    end,
                    toggleActions,
                  },
                });

                addTweens(tl);

                if (split) {
                  splits.push(split);
                }
              });
          });

        ScrollTrigger.refresh();
      };

      frameRef.current = requestAnimationFrame(initialize);

      return () => {
        if (frameRef.current !== null) {
          cancelAnimationFrame(frameRef.current);
        }

        splits.forEach((split) => split.revert());
      };
    },
    {
      dependencies: [pathname],
      revertOnUpdate: true,
    },
  );
}
