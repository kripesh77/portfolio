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

type IntroOptions = {
  duration?: number;
  stagger?: number;
  ease?: string;
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

// Reusable hook for Heading intro (yPercent slide-up) with custom trigger
export function useSlideUp(
  targetRef: RefObject<
    HTMLElement | HTMLElement[] | NodeListOf<Element> | null
  >,
  options: IntroOptions = {},
) {
  const [splitInstance, setSplitInstance] = useState<SplitText | null>(null);

  useGSAP(
    () => {
      if (!targetRef.current) return;

      const triggerElement = resolveTrigger(
        options.trigger,
        targetRef.current as HTMLElement,
      );

      const split = SplitText.create(targetRef.current, {
        type: "chars, words, lines",
        mask: "words",
        charsClass: "char",
      });

      gsap.set(targetRef.current, { visibility: "visible" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: options.start ?? "top bottom",
          end: options.end ?? "bottom top",
          toggleActions: options.toggleActions ?? "play reverse play reverse",
        },
      });

      split.words.forEach((word) => {
        tl.from(
          word.children,
          {
            yPercent: 100,
            stagger: options.stagger ?? 0.05,
            duration: options.duration ?? 1,
            ease: options.ease ?? "customEase",
          },
          0,
        );
      });

      setSplitInstance(split);

      return () => {
        split.revert();
      };
    },
    { dependencies: [targetRef] },
  );

  return splitInstance;
}

// Reusable hook for Paragraph intro (xPercent slide-in) with custom trigger
export function useSlideIn(
  targetRef: RefObject<
    HTMLElement | HTMLElement[] | NodeListOf<Element> | null
  >,
  options: IntroOptions = {},
) {
  const [splitInstance, setSplitInstance] = useState<SplitText | null>(null);

  useGSAP(
    () => {
      if (!targetRef.current) return;

      const triggerElement = resolveTrigger(
        options.trigger,
        targetRef.current as HTMLElement,
      );

      const split = SplitText.create(targetRef.current, {
        type: "chars, words, lines",
        mask: "chars",
        charsClass: "char",
      });

      gsap.set(targetRef.current, { visibility: "visible" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: options.start ?? "top bottom",
          end: options.end ?? "bottom top",
          toggleActions: options.toggleActions ?? "play reverse play reverse",
        },
      });

      // All words animate in parallel (added at position 0), only the chars
      // within each word stagger — same structure as useSlideUp. With
      // mask: "chars" each char is wrapped in a .char-mask element, so we
      // target the .char elements themselves; animating word.children would
      // move the masks too and break the clipping.
      split.words.forEach((word) => {
        tl.from(
          word.querySelectorAll(".char"),
          {
            xPercent: 100,
            stagger: options.stagger ?? 0.05,
            duration: options.duration ?? 1,
            ease: options.ease ?? "customEase",
          },
          0,
        );
      });

      setSplitInstance(split);

      return () => {
        split.revert();
      };
    },
    { dependencies: [targetRef] },
  );

  return splitInstance;
}
