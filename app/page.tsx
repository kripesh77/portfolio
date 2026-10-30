"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import { useSlideIn, useSlideUp } from "@/hooks/useTextAnimations";

type Direction = "left" | "right" | "top" | "bottom";

type Character = {
  element: HTMLElement;
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
  const h1Split = useSlideUp(headingRef, { trigger: paragraphRef });
  const pSplit = useSlideIn(paragraphRef, { trigger: paragraphRef });

  // Interactive Hover & Random Loop Logic
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

        const fragment = document.createDocumentFragment();
        fragment.appendChild(track);

        charElement.textContent = "";
        charElement.appendChild(fragment);

        characters.push({
          element: charElement,
          track,
          clone,
          busy: false,
        });
      });

      let previousIndex = -1;
      let isHovering = false;
      let stopped = false;
      let activeRandom: Character | null = null;
      let randomCall: gsap.core.Tween | null = null;

      const hoverQueue = new Set<Character>();
      const hoverHandlers = new Map<HTMLElement, () => void>();

      const clearRandomCall = () => {
        randomCall?.kill();
        randomCall = null;
      };

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

      const getRandomDirection = (): Direction => {
        return DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
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

      const animateCharacter = (
        character: Character,
        direction: Direction,
        onComplete?: () => void,
      ) => {
        if (character.busy || stopped) return;

        character.busy = true;

        positionClone(character, direction);

        gsap.set(character.track, {
          xPercent: 0,
          yPercent: 0,
        });

        gsap.to(character.track, {
          ...OFFSETS[direction],
          duration: 0.4,
          ease: "power2.inOut",
          onComplete: () => {
            gsap.set(character.track, {
              xPercent: 0,
              yPercent: 0,
            });

            gsap.set(character.clone, {
              left: "-105%",
              top: 0,
            });

            character.busy = false;

            if (activeRandom === character) {
              activeRandom = null;
            }

            onComplete?.();

            if (hoverQueue.size > 0 && !stopped) {
              const next = hoverQueue.values().next().value as
                | Character
                | undefined;

              if (next) {
                hoverQueue.delete(next);
                runHover(next);
              }

              return;
            }

            if (!isHovering && !stopped) {
              scheduleRandom(0.5 + Math.random() * 2);
            }
          },
        });
      };

      const runHover = (character: Character) => {
        if (stopped) return;

        isHovering = true;
        clearRandomCall();

        if (character.busy) {
          hoverQueue.add(character);
          return;
        }

        animateCharacter(character, "left", () => {
          isHovering = false;
        });
      };

      const scheduleRandom = (delay: number) => {
        if (stopped || isHovering || randomCall) return;

        randomCall = gsap.delayedCall(delay, () => {
          randomCall = null;

          if (stopped || isHovering) return;

          const character = getRandomCharacter();

          if (!character) {
            scheduleRandom(0.5);
            return;
          }

          activeRandom = character;

          animateCharacter(character, getRandomDirection());
        });
      };

      const canHover = window.matchMedia(
        "(hover: hover) and (pointer: fine)",
      ).matches;

      if (canHover) {
        characters.forEach((character) => {
          const handler = () => runHover(character);
          hoverHandlers.set(character.element, handler);
          character.element.addEventListener("mouseenter", handler);
        });
      }

      scheduleRandom(0.5 + Math.random() * 1.5);

      return () => {
        stopped = true;
        clearRandomCall();

        characters.forEach((character) => {
          const handler = hoverHandlers.get(character.element);
          if (handler) {
            character.element.removeEventListener("mouseenter", handler);
          }

          gsap.killTweensOf(character.track);
          gsap.killTweensOf(character.clone);
        });
      };
    },
    { scope: container, dependencies: [h1Split, pSplit] },
  );

  return (
    <div className="home_container">
      <div className="home pt-2" ref={container}>
        <div className="sr-only">KRIPESH GHIMIRE</div>
        <div aria-hidden="true">
          <h1 ref={headingRef}>KRIPESH GHIMIRE</h1>
          <p ref={paragraphRef}>FULL-STACK DEVELOPER</p>
        </div>

        <div>hi</div>
      </div>
    </div>
  );
}
