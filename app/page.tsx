"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, Flip, CustomEase);

CustomEase.create("customEase", "M0,0 C0.736,0.377 0.11,0.961 1,1 ");

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const h1Split = SplitText.create("h1", {
        type: "chars, words, lines",
        mask: "lines",
        charsClass: "char",
      });

      const pSplit = SplitText.create("p", {
        type: "chars, words, lines",
        mask: "chars",
        charsClass: "char",
      });

      gsap.set("h1, p", { visibility: "visible" });

      h1Split.words.forEach((word) => {
        const chars = word.querySelectorAll(".char");

        gsap.from(chars, {
          yPercent: 100,
          stagger: 0.03,
          duration: 0.8,
          ease: "customEase",
        });
      });

      gsap.from(pSplit.chars, {
        xPercent: 100,
        duration: 0.8,
        stagger: 0.03,
        ease: "customEase",
      });
    },
    { scope: container },
  );
  return (
    <div className="home_container">
      <div className="home pt-2" ref={container}>
        <div>
          <h1>KRIPESH GHIMIRE</h1>
          <p>FULL-STACK DEV</p>
        </div>
        <p>hi</p>
      </div>
    </div>
  );
}
