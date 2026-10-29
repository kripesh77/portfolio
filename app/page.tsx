"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, Flip, CustomEase);

CustomEase.create("customEase", "M0,0 C0.841,0.291 0.07,1 1,1 ");

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const h1Split = SplitText.create("h1", {
        type: "chars, words, lines",
        mask: "lines",
        charsClass: "char",
      });

      gsap.set("h1", { visibility: "visible" });

      h1Split.words.forEach((word) => {
        const chars = word.querySelectorAll(".char");

        gsap.from(chars, {
          yPercent: 100,
          stagger: 0.04,
          duration: 1.5,
          ease: "customEase",
          onComplete: () => {
            h1Split.revert();
          },
        });
      });
    },
    { scope: container },
  );
  return (
    <div className="home_container">
      <div className="home" ref={container}>
        <h1>KRIPESH GHIMIRE</h1>
        <p className="font-medium">Full Stack Developer</p>
      </div>
    </div>
  );
}
