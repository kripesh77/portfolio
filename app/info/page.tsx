"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, SplitText);

export default function Info() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const split = new SplitText(".info p", {
        type: "lines, words",
        linesClass: "line",
        wordsClass: "word",
        mask: "lines",
      });

      gsap.set(".info p", { visibility: "visible" });

      split.lines.forEach((word) => {
        const words = word.querySelectorAll(".word");

        gsap.from(words, {
          yPercent: 150,
          rotateZ: 30,
          stagger: 0.01,
          duration: 1,
          delay: 0.5,
          transformOrigin: "top top",
          ease: "power4.out",
          scrollTrigger: {
            trigger: container.current,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play reverse play reverse",
          },
        });
      });
    },
    { scope: container },
  );

  return (
    <div className="info">
      <div>
        <div className="col" ref={container}>
          <p className="font-normal">
            Kaelon is a portrait photographer who captures striking and artistic
            images. His work focuses on light, shadow, and movement, creating
            portraits that feel both modern and timeless. With a minimal and
            moody style, he brings out raw emotion and unique beauty in every
            subject.
          </p>
        </div>
      </div>

      <div className="h-dvh"></div>
    </div>
  );
}
