"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import Logo, { Lg } from "@/components/Logo";

gsap.registerPlugin(useGSAP, SplitText, ScrollTrigger);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const trigger = container.current;
      const scroller = document.querySelector(".main-scroll");

      if (!trigger || !scroller) {
        console.warn(
          "[hero] .home or .main-scroll missing — hero animation skipped",
        );
        return;
      }

      // Original SplitText animation
      const heroText = new SplitText(".home h1", {
        type: "chars",
        mask: "chars",
      });

      gsap.set(heroText.chars, { y: 400 });

      gsap.fromTo(
        heroText.chars,
        { y: 400 },
        {
          y: 0,
          stagger: 0.035,
          duration: 0.8,
          ease: "power3.out",
        },
      );

      // Scroll-velocity skew

      const boxes = gsap.utils.toArray<HTMLElement>(
        document.querySelectorAll(".velocity-box"),
      );

      const clamp = gsap.utils.clamp(-15, 15);

      const skewSetters = boxes.map((box, index) => {
        // Odd-numbered boxes: left edge fixed
        // Even-numbered boxes: right edge fixed
        box.style.transformOrigin =
          index % 2 === 0 ? "left center" : "right center";

        return gsap.quickTo(box, "skewY", {
          duration: 0.25,
          ease: "power2.out",
        });
      });

      let resetCall: gsap.core.Tween | undefined;

      ScrollTrigger.create({
        scroller,

        onUpdate: (self) => {
          const velocity = self.getVelocity();
          const skew = clamp(velocity / -150);

          skewSetters.forEach((setSkew, index) => {
            setSkew(index % 2 === 0 ? skew : -skew);
          });

          resetCall?.kill();

          resetCall = gsap.delayedCall(0.15, () => {
            skewSetters.forEach((setSkew) => setSkew(0));
          });
        },
      });
    },
    { scope: container },
  );

  return (
    <div>
      <div className="h-dvh bg-black flex justify-center items-center w-full">
        <div className="flex justify-center items-center gap-8 -translate-x-10">
          <div className="velocity-box w-40 h-40 bg-gray-300"></div>

          <div className="velocity-box w-40 h-40 bg-gray-300"></div>
        </div>
      </div>

      <div className="home" ref={container}>
        <h1>
          <span>Kripesh</span>
          <span>Ghimire</span>
        </h1>
      </div>

      <div className="h-dvh bg-black"></div>
      <div className="h-dvh bg-amber-300"></div>
      <div className="h-dvh bg-blue-500"></div>
      <div className="h-dvh bg-orange-500"></div>
      <div className="h-dvh bg-gray-400"></div>
      <div className="h-dvh bg-black"></div>
      <div className="h-dvh bg-red-500"></div>
    </div>
  );
}
