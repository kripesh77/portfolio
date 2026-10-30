"use client";

import { useRef, useState, useEffect, MouseEventHandler } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hamburger from "./Hamburger";
import { usePathname } from "next/navigation";
import { lenisRef } from "./lenisStore";

gsap.registerPlugin(ScrollTrigger);

/** Downward scroll distance (px) the scroller must travel before the marks
 *  slide out of view. Any upward scroll brings them straight back. */
const NAV_HIDE_AFTER = 120;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();
  const isOpenRef = useRef(false);

  useEffect(() => {
    if (isOpenRef.current) {
      timeline.current?.pause(0);
      isOpenRef.current = false;
      setIsOpen(false);
      lenisRef.current?.start();
    }
  }, [pathname]);

  // Slide the marks off while scrolling down, bring them back on scroll up.
  // The logo lives in layout.tsx (outside this component), so the shared
  // state is a class on <html> and CSS drives both elements from there.
  //
  // Lenis scrolls .main-scroll (window never moves), so the trigger binds to
  // that element explicitly: this effect runs before LenisGsapSync registers
  // the global ScrollTrigger default scroller.
  useEffect(() => {
    const scroller = document.querySelector<HTMLElement>(".main-scroll");
    if (!scroller) return;

    const root = document.documentElement;

    const trigger = ScrollTrigger.create({
      scroller,
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const pastThreshold = self.scroll() > NAV_HIDE_AFTER;
        const scrollingDown = self.direction === 1;
        root.classList.toggle("nav-hidden", pastThreshold && scrollingDown);
      },
    });

    return () => {
      trigger.kill();
      root.classList.remove("nav-hidden");
    };
  }, []);

  function closeMenu() {
    timeline.current?.reverse();
    isOpenRef.current = false;
    setIsOpen(false);
    lenisRef.current?.start();
  }

  function handleClick() {
    if (!timeline.current) {
      timeline.current = gsap.timeline({ paused: true });

      timeline.current
        .fromTo(
          ".navcontent",
          { y: "-100%", zIndex: -1 },
          {
            y: 0,
            zIndex: 999,
            duration: 0.5,
            ease: "power2.inOut",
          },
          0,
        )
        .to(
          ".main-shell",
          {
            scale: 0.97,
            borderRadius: "24px",
            y: "40vh",
            duration: 0.5,
            ease: "power2.inOut",
          },
          0,
        );
    }

    if (isOpenRef.current) {
      timeline.current.reverse();
      // Unlock scrolling (wheel/touch) while the card animates back
      lenisRef.current?.start();
    } else {
      timeline.current.play();

      lenisRef.current?.stop();

      window.dispatchEvent(new Event("menu-open"));
    }

    isOpenRef.current = !isOpenRef.current;
    setIsOpen(isOpenRef.current);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const x = gsap.utils.mapRange(rect.left, rect.right, -1, 1, e.clientX);

    const y = gsap.utils.mapRange(rect.top, rect.bottom, -1, 1, e.clientY);

    gsap.to(".hamburger svg", {
      x: x * 10,
      y: y * 10,
      rotationY: x * 30,
      rotationX: -y * 30,
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
    });
  }

  function handleMouseLeave() {
    gsap.to(".hamburger svg", {
      x: 0,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 0.7,
      ease: "elastic.out(1, 0.4)",
      overwrite: "auto",
    });
  }

  return (
    <nav className="navbar">
      <div
        className={`absolute top-0 right-0 transition-transform duration-500 w-fit cursor-pointer ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={closeMenu}
      >
        <svg
          width="110"
          height="110"
          viewBox="0 0 110 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: "rotate(45deg)" }}
        >
          <path d="M55 0L55 110" strokeWidth="2" stroke="#D3FD50" />
          <path d="M0 55H110" strokeWidth="2" stroke="#D3FD50" />
        </svg>
      </div>
      <div className="hamburger-slide">
        <button
          type="button"
          className={`hamburger absolute top-0 right-0 transition-transform duration-500 p-4 ${
            isOpen ? "translate-x-[120%]" : "translate-x-0"
          }`}
          onClick={handleClick}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Hamburger />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
