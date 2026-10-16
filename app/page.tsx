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
        mask: "chars",
      });
      gsap.set(heroText.chars, { y: 400 });

      gsap.to(heroText.chars, {
        y: 0,
        duration: 1,
        stagger: 0.075,
        ease: "power3.out",
        delay: 1.125,
      });
    },
    { scope: container },
  );
  return (
    <div className="home" ref={container}>
      <h1>Kripesh</h1>
    </div>
  );
}
