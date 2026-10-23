"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { K, R, I, P, E, S, H } from "@/components/letters/Letters";

const VISIBLE_RATIO = 0.4;
const GAP = 2;
const COPY_COUNT = 6;

gsap.registerPlugin(useGSAP, ScrollTrigger);

const LETTERS = [K, R, I, P, E, S, H];

function LetterRow() {
  return (
    <div className="footer-copy">
      {LETTERS.map((Letter, index) => (
        <div className="footer-letter-mask" key={index}>
          <Letter />
        </div>
      ))}
    </div>
  );
}

export default function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);
  const firstScreenRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const [fontSize, setFontSize] = useState(100);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const fitText = () => {
      const availableWidth = footer.clientWidth;
      if (!availableWidth) return;

      const sample = footer.querySelector<HTMLImageElement>(".footer-copy img");
      if (!sample) return;

      const naturalWidth = sample.naturalWidth;
      const naturalHeight = sample.naturalHeight;

      if (!naturalWidth || !naturalHeight) return;

      const nextFontSize =
        (availableWidth * naturalHeight) / (naturalWidth * LETTERS.length);

      setFontSize((previous) =>
        Math.abs(previous - nextFontSize) > 0.1 ? nextFontSize : previous,
      );
    };

    fitText();

    const observer = new ResizeObserver(fitText);
    observer.observe(footer);

    const images = footer.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", fitText);
      }
    });

    return () => {
      observer.disconnect();
      images.forEach((img) => {
        img.removeEventListener("load", fitText);
      });
    };
  }, []);

  useGSAP(
    () => {
      const firstScreen = firstScreenRef.current;
      const list = listRef.current;

      if (!firstScreen || !list) return;

      const scroller = document.querySelector(".main-scroll");

      const letters = gsap.utils.toArray<HTMLElement>(".footer-copy", list);

      gsap.to(letters, {
        y: () => fontSize * VISIBLE_RATIO + GAP,
        scale: 0.95,
        stagger: 0.4,
        ease: "none",
        scrollTrigger: {
          trigger: firstScreen,
          scroller: scroller,
          start: "top 10%",
          endTrigger: ".footer-text",
          end: () => `+=${(fontSize * VISIBLE_RATIO + GAP) * COPY_COUNT}`,
          scrub: true,
          markers: true,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.refresh();
    },
    {
      scope: footerRef,
      dependencies: [fontSize],
      revertOnUpdate: true,
    },
  );

  return (
    <footer ref={footerRef} className="site-footer">
      <section
        ref={firstScreenRef}
        className="footer-first-screen"
        style={{
          height: `${
            fontSize * VISIBLE_RATIO * COPY_COUNT + GAP * (COPY_COUNT - 1)
          }px`,
        }}
      >
        <div
          ref={listRef}
          className="footer-copy-list"
          style={
            {
              "--footer-font-size": `${fontSize}px`,
              "--footer-visible-height": `${fontSize * VISIBLE_RATIO}px`,
              "--footer-row-height": `${fontSize * VISIBLE_RATIO + GAP}px`,
              gap: `${GAP}px`,
            } as React.CSSProperties
          }
        >
          {Array.from({ length: COPY_COUNT }, (_, index) => (
            <div className="footer-copy-row" key={index}>
              <div className="footer-copy-mask">
                <LetterRow />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="footer-second-screen"
        style={
          {
            "--footer-font-size": `${fontSize}px`,
          } as React.CSSProperties
        }
      >
        <div className="footer-text">
          <div className="footer-copy-mask">
            <LetterRow />
          </div>
        </div>
      </section>
    </footer>
  );
}
