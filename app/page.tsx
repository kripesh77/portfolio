"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { useRef } from "react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, Flip);

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const spans = gsap.utils.toArray<HTMLElement>(
        ".home h1 span",
        container.current,
      );

      gsap.set(".home h1", { autoAlpha: 1 });

      const tl = gsap.timeline({
        delay: 0.6,
        onUpdate: () => {
          if (tl.progress() >= 0.25 && !hasTriggered) {
            hasTriggered = true;

            const state = Flip.getState(".home h1, .home p", {
              props: "transform",
            });

            gsap.set(container.current, {
              justifyContent: "space-around",
            });

            Flip.from(state, {
              duration: 1.6,
              ease: "expo.inOut",
              absolute: false,
            });
          }
        },
      });

      let hasTriggered = false;

      const splitInstances: SplitText[] = [];

      spans.forEach((span) => {
        const split = SplitText.create(span, {
          type: "chars",
          charsClass: "char",
        });

        splitInstances.push(split);

        tl.fromTo(
          split.chars,
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1,
            stagger: 0.045,
            ease: "power4.out",
            clearProps: "transform",
          },
          "<+=0.02",
        );
      });

      tl.add(() => {
        splitInstances.forEach((split) => split.revert());
      });
    },
    { scope: container },
  );

  return (
    <div className="home_container">
      <div className="home" ref={container}>
        <h1>
          <span className="flex justify-center">KRIPESH</span>
          <span className="flex justify-center">GHIMIRE</span>
        </h1>
        <p className="font-medium">Full Stack Developer</p>
      </div>
    </div>
  );
}
