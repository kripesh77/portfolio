"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useRevealOnScroll } from "@/hooks/useTextAnimations";

type Direction = "left" | "right" | "top" | "bottom";

type Character = {
  track: HTMLElement;
  clone: HTMLElement;
  busy: boolean;
};

const DIRECTIONS: Direction[] = ["left", "right", "top", "bottom"];

const OFFSETS: Record<Direction, { xPercent: number; yPercent: number }> = {
  left: { xPercent: -105, yPercent: 0 },
  right: { xPercent: 105, yPercent: 0 },
  top: { xPercent: 0, yPercent: -105 },
  bottom: { xPercent: 0, yPercent: 105 },
};

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);

  // Trigger decoupled intro animation hooks
  const h1Split = useRevealOnScroll(headingRef, "slideUp", {
    trigger: paragraphRef,
  });
  const pSplit = useRevealOnScroll(paragraphRef, "slideIn", {
    trigger: paragraphRef,
    duration: 1.2,
  });

  // Random character loop — one char at a time drifts out in a random
  // direction while its clone slides in behind, then the next is queued.
  useGSAP(
    () => {
      if (!h1Split || !pSplit) return;

      const allChars = [...h1Split.chars, ...pSplit.chars];
      const characters: Character[] = [];

      allChars.forEach((char) => {
        const charElement = char as HTMLElement;
        const original = charElement.textContent ?? "";

        const track = document.createElement("span");
        track.className = "char-track";

        const first = document.createElement("span");
        first.className = "char-face";
        first.textContent = original;

        const clone = document.createElement("span");
        clone.className = "char-face char-clone";
        clone.textContent = original;
        clone.setAttribute("aria-hidden", "true");

        track.append(first, clone);
        charElement.textContent = "";
        charElement.appendChild(track);

        characters.push({ track, clone, busy: false });
      });

      let previousIndex = -1;
      let stopped = false;
      let randomCall: gsap.core.Tween | null = null;

      const getRandomCharacter = () => {
        const available: { character: Character; index: number }[] = [];
        for (let i = 0; i < characters.length; i++) {
          if (!characters[i].busy && i !== previousIndex) {
            available.push({ character: characters[i], index: i });
          }
        }

        if (!available.length) return null;

        const selected =
          available[Math.floor(Math.random() * available.length)];
        previousIndex = selected.index;
        return selected.character;
      };

      const positionClone = (character: Character, direction: Direction) => {
        gsap.set(character.clone, {
          left:
            direction === "right"
              ? "-105%"
              : direction === "left"
                ? "105%"
                : "0",
          top:
            direction === "bottom"
              ? "-105%"
              : direction === "top"
                ? "105%"
                : "0",
        });
      };

      const animateCharacter = (character: Character, direction: Direction) => {
        if (character.busy || stopped) return;

        character.busy = true;

        positionClone(character, direction);

        gsap.set(character.track, { xPercent: 0, yPercent: 0 });

        gsap.to(character.track, {
          ...OFFSETS[direction],
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(character.track, { xPercent: 0, yPercent: 0 });
            gsap.set(character.clone, { left: "-105%", top: 0 });
            character.busy = false;

            scheduleRandom(0.5 + Math.random() * 2);
          },
        });
      };

      const scheduleRandom = (delay: number) => {
        if (stopped || randomCall) return;

        randomCall = gsap.delayedCall(delay, () => {
          randomCall = null;

          if (stopped) return;

          const character = getRandomCharacter();

          if (!character) {
            scheduleRandom(0.5);
            return;
          }

          animateCharacter(
            character,
            DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)],
          );
        });
      };

      scheduleRandom(0.5 + Math.random() * 1.5);

      return () => {
        stopped = true;
        randomCall?.kill();

        characters.forEach((character) => {
          gsap.killTweensOf(character.track);
          gsap.killTweensOf(character.clone);
        });
      };
    },
    { scope: container, dependencies: [h1Split, pSplit] },
  );

  return (
    <>
      <div className="home_container">
        <div className="home pt-2" ref={container}>
          <div className="sr-only">KRIPESH GHIMIRE</div>
          <div aria-hidden="true">
            <h1 ref={headingRef}>KRIPESH GHIMIRE</h1>
            <p ref={paragraphRef}>FULL-STACK DEVELOPER</p>
          </div>
        </div>
      </div>
      <div className="text-animation">
        <div className="slide-up">Over 2</div>
        <div className="slide-in">years experience</div>
      </div>
    </>
  );
}
