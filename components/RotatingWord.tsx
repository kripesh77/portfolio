"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import { K, R, I, P, E, S, H, G, M } from "./letters/Letters";

gsap.registerPlugin(useGSAP);

const LETTERS = {
  K,
  R,
  I,
  P,
  E,
  S,
  H,
  G,
  M,
} as const;

type RotatingWordProps = {
  front: string;
  back: string;
  duration?: number;
  autoRotate?: boolean;
  staggerDelay?: number;
};

export default function RotatingWord({
  front,
  back,
  duration = 2.5,
  autoRotate = true,
  staggerDelay = 0.08,
}: RotatingWordProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const maxLen = Math.max(front.length, back.length);
  const frontChars = Array.from(front.toUpperCase().padEnd(maxLen, " "));
  const backChars = Array.from(back.toUpperCase().padEnd(maxLen, " "));

  const faceWords = [frontChars, backChars, frontChars, backChars];

  useGSAP(
    () => {
      if (!autoRotate || !containerRef.current) return;

      const rotators = containerRef.current.querySelectorAll(".letter-rotator");

      // Animate each letter rotator individually so it loops endlessly without resting
      rotators.forEach((rotator, index) => {
        gsap.to(rotator, {
          rotationX: "-=360",
          duration,
          ease: "none",
          repeat: -1,
          delay: index * staggerDelay,
          transformOrigin: "50% 50%",
        });
      });
    },
    {
      scope: containerRef,
      dependencies: [front, back, duration, autoRotate, staggerDelay],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      className="rotating-word"
      ref={containerRef}
      aria-label={`${front}, ${back}`}
    >
      <div className="rotating-word__container">
        {Array.from({ length: maxLen }).map((_, charIdx) => (
          <div className="letter-scene" key={charIdx}>
            <div className="letter-rotator">
              {faceWords.map((faceChars, faceIdx) => {
                const char = faceChars[charIdx];
                const LetterComponent = LETTERS[char as keyof typeof LETTERS];

                return (
                  <div
                    key={faceIdx}
                    className={`letter-face letter-face--${faceIdx}`}
                  >
                    {LetterComponent ? (
                      <LetterComponent />
                    ) : (
                      <span className="rotating-word__fallback">
                        {char === " " ? "\u00A0" : char}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
