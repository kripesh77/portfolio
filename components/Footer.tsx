"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger, SplitText } from "gsap/all";

type FooterProps = {
  text?: string;
};

const VISIBLE_RATIO = 0.25;
const GAP = 2;
const COPY_COUNT = 6;

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function Footer({ text = "KRIPESH" }: FooterProps) {
  const footerRef = useRef<HTMLElement | null>(null);
  const firstScreenRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLHeadingElement | null>(null);

  const [fontSize, setFontSize] = useState(100);

  const displayText = Array.from(text).slice(0, 7).join("");

  useLayoutEffect(() => {
    const footer = footerRef.current;
    const measure = measureRef.current;

    if (!footer || !measure) return;

    const fitText = () => {
      const availableWidth = footer.clientWidth;
      if (!availableWidth) return;

      const styles = getComputedStyle(measure);
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");

      if (!context) return;

      context.font = `700 100px ${styles.fontFamily}`;

      const naturalWidth = context.measureText(displayText).width;
      if (!naturalWidth) return;

      const nextFontSize = (100 * availableWidth) / naturalWidth;

      setFontSize((previous) =>
        Math.abs(previous - nextFontSize) > 0.1 ? nextFontSize : previous,
      );
    };

    fitText();

    const observer = new ResizeObserver(fitText);
    observer.observe(footer);

    window.addEventListener("resize", fitText);
    document.fonts.ready.then(fitText);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", fitText);
    };
  }, [displayText]);

  useLayoutEffect(() => {
    const firstScreen = firstScreenRef.current;
    const list = listRef.current;

    if (!firstScreen || !list) return;

    const scroller = document.querySelector(".main-scroll");
    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      list.querySelectorAll<HTMLElement>(".footer-copy").forEach((element) => {
        splits.push(
          SplitText.create(element, {
            type: "lines",
            mask: "lines",
          }),
        );
      });

      const lines = splits.flatMap((split) => split.lines);

      gsap.to(lines, {
        yPercent: 120,
        stagger: 0.15,
        ease: "none",
        scrollTrigger: {
          trigger: firstScreen,
          scroller: scroller || undefined,
          start: "top 10%",
          endTrigger: ".footer-text",
          end: () =>
            `+=${document.querySelector(".footer-text")!.getBoundingClientRect().bottom + window.scrollY - window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    }, firstScreen);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  }, [displayText, fontSize]);

  return (
    <footer ref={footerRef} className="site-footer">
      <section
        ref={firstScreenRef}
        className="footer-first-screen"
        style={{
          height: `${fontSize * VISIBLE_RATIO * COPY_COUNT}px`,
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
                <h2 className="footer-copy">{displayText}</h2>
              </div>
            </div>
          ))}
        </div>

        <h2
          ref={measureRef}
          className="footer-copy footer-measure"
          aria-hidden="true"
        >
          {displayText}
        </h2>
      </section>

      <section
        className="footer-second-screen"
        style={
          {
            "--footer-font-size": `${fontSize}px`,
          } as React.CSSProperties
        }
      >
        <h2 className="footer-text">{displayText}</h2>
      </section>
    </footer>
  );
}
