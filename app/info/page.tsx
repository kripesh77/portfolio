"use client";
import { useRef } from "react";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";

gsap.registerPlugin(useGSAP, SplitText);

export default function Info() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const split = new SplitText(".info p", {
      type: "lines",
      mask: "lines",
      linesClass: "line",
    });

    gsap.set(".info p", { visibility: "visible" });

    gsap.fromTo(
      split.lines,
      { y: 400 },
      {
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        onComplete: () => {
          // split.revert();
        },
      },
    );
  });

  return (
    <>
      <div className="info" ref={container}>
        <div className="col"></div>
        <div className="col">
          <p>
            Kaelon is a portrait photographer who captures striking and artistic
            images. His work focuses on light, shadow, and movement, creating
            portraits that feel both modern and timeless. With a minimal and
            moody style, he brings out raw emotion and unique beauty in every
            subject.
          </p>
        </div>
      </div>
      <div className="h-dvh"></div>
    </>
  );
}
