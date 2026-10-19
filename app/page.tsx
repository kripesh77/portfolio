"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import { useRef } from "react";

gsap.registerPlugin(useGSAP, SplitText);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const heroText = new SplitText(".home h1", {
        type: "chars",
      });

      gsap.set(heroText.chars, { y: 400 });
      gsap.set(".home h1", { visibility: "visible" });

      gsap.fromTo(
        heroText.chars,
        { y: 400 },
        {
          y: 0,
          stagger: 0.035,
          duration: 0.8,
          delay: 0.6,
          ease: "power3.out",
          onComplete: () => {
            heroText.revert();
          },
        },
      );
    },
    { scope: container },
  );

  return (
    <>
      <div className="home" ref={container}>
        <h1>
          <span>kripesh</span>
          <span>ghimire</span>
        </h1>
      </div>
    </>
  );
}
