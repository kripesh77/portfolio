"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Flip } from "gsap/Flip";
import { useRef } from "react";
import { K, R, I, P, E, S, H, G, M } from "@/components/letters/Letters";

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
          if (tl.progress() >= 0.3 && !hasTriggered) {
            hasTriggered = true;

            const state = Flip.getState(".home h1", {
              props: "transform",
            });

            gsap.set(container.current, {
              placeItems: "start center",
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

      spans.forEach((span) => {
        const letters = span.querySelectorAll("img");

        tl.fromTo(
          letters,
          { yPercent: 120 },
          {
            yPercent: 0,
            duration: 1.2,
            stagger: 0.045,
            ease: "power4.out",
            clearProps: "transform",
          },
          "<+=0.1",
        );
      });
    },
    { scope: container },
  );

  return (
    <div className="home" ref={container}>
      <h1>
        <span>
          <K />
          <R />
          <I />
          <P />
          <E />
          <S />
          <H />
        </span>
        <span>
          <G />
          <H />
          <I />
          <M />
          <I />
          <R />
          <E />
        </span>
      </h1>
    </div>
  );
}
