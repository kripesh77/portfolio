"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, RefObject } from "react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

CustomEase.create("customEase", "1, .01, .43, .95");

type TriggerType = string | HTMLElement | RefObject<HTMLElement | null>;

type RevealTarget = HTMLElement | HTMLElement[] | NodeListOf<Element>;

type TimingOptions = {
  duration?: number;
  stagger?: number;
  ease?: string;
};

type ScrollOptions = TimingOptions & {
  start?: string;
  end?: string;
  toggleActions?: string;
  trigger?: TriggerType; // Accepts a RefObject, CSS selector string, or HTMLElement
};

// Resolves custom trigger option or falls back to the target element itself
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
   SPECS — the single source of truth for WHAT each reveal is.
   Mask and word-targets are a load-bearing pair: with
   mask: "chars" every char is wrapped in a .char-mask element,
   so the chars must be queried — animating word.children would
   move the masks and break the clipping.
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
} as const satisfies Record<
  string,
  {
    mask: "words" | "chars";
    from: { yPercent?: number; xPercent?: number };
    targets: (word: Element) => Element[];
  }
>;

type RevealName = keyof typeof SPECS;

// Shared core: splits once, sets visibility, hands back the timeline glue.
// Timing defaults live here so every mode resolves them the same way.
const buildReveal = (
  target: RevealTarget,
  name: RevealName,
  { duration = 1, stagger = 0.05, ease = "customEase" }: TimingOptions = {},
) => {
  const spec = SPECS[name];

  const split = SplitText.create(target, {
    type: "chars, words, lines",
    mask: spec.mask,
    charsClass: "char",
  });

  split.chars.forEach((char, i) => {
    (char as HTMLElement).style.setProperty("--i", String(i));
  });

  gsap.set(target, { visibility: "visible" });

  // All words animate in parallel (each tween added at position 0);
  // only the chars within a word stagger.
  const addTweens = (tl: gsap.core.Timeline) => {
    split.words.forEach((word) => {
      tl.from(spec.targets(word), { ...spec.from, stagger, duration, ease }, 0);
    });
  };

  return { split, addTweens };
};

/** Scroll-triggered reveal — the engine owns the timeline and its
 *  ScrollTrigger. Returns the split (e.g. to reach .chars). */
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

      const tl = gsap.timeline({
        scrollTrigger: { trigger: triggerElement, start, end, toggleActions },
      });

      const { split, addTweens } = buildReveal(
        targetRef.current,
        name,
        options,
      );
      addTweens(tl);

      setSplitInstance(split);

      return () => {
        split.revert();
      };
    },
    { dependencies: [targetRef] },
  );

  return splitInstance;
}

/** Timeline-attach reveal — the CALLER owns the timeline, so the reveal
 *  plays/reverses in sync with whatever else sits on it. */
export function attachReveal(
  tl: gsap.core.Timeline,
  target: RevealTarget,
  name: RevealName,
  options: TimingOptions = {},
): SplitText {
  const { split, addTweens } = buildReveal(target, name, options);
  addTweens(tl);
  return split;
}

/** Direct reveal — splits and plays immediately; call it when your event
 *  fires. Keep the handle to reverse later and revert on teardown. */
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
      split.revert();
      timeline.kill();
    },
  };
}
