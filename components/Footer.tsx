"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

type FooterProps = {
  text?: string;
};

export default function Footer({ text = "KRIPESH" }: FooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLHeadingElement | null>(null);

  const displayText = Array.from(text).slice(0, 7).join("");

  useGSAP(
    () => {
      const footer = footerRef.current;
      const heading = textRef.current;

      if (!footer || !heading) return;

      const fitText = (): void => {
        const styles = getComputedStyle(heading);
        const availableWidth = footer.clientWidth;

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context || availableWidth <= 0) return;

        context.font = `700 100px ${styles.fontFamily}`;

        const naturalWidth = context.measureText(displayText).width;

        if (naturalWidth > 0) {
          heading.style.fontSize = `${(100 * availableWidth) / naturalWidth}px`;
        }
      };

      const observer = new ResizeObserver(fitText);
      observer.observe(footer);

      document.fonts.ready.then(fitText);
      fitText();

      return () => observer.disconnect();
    },
    { scope: footerRef },
  );

  return (
    <footer ref={footerRef} className="site-footer">
      <h2 ref={textRef} className="footer-text" aria-label={displayText}>
        {displayText}
      </h2>
    </footer>
  );
}
