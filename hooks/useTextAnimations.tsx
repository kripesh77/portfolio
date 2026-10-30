"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useState, RefObject } from "react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, CustomEase, SplitText);

CustomEase.create("customEase", "M0,0 C0.736,0.377 0.11,0.961 1,1");

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
        mask: "lines",
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
            stagger: options.stagger ?? 0.03,
            duration: options.duration ?? 0.8,
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

      gsap.from(split.chars, {
        xPercent: 100,
        duration: options.duration ?? 0.8,
        stagger: options.stagger ?? 0.03,
        ease: options.ease ?? "customEase",
        scrollTrigger: {
          trigger: triggerElement,
          start: options.start ?? "top bottom",
          end: options.end ?? "bottom top",
          toggleActions: options.toggleActions ?? "play reverse play reverse",
        },
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
