"use client";

import { useRef, useState, useEffect, MouseEventHandler } from "react";
import gsap from "gsap";
import Hamburger from "./Hamburger";
import { usePathname } from "next/navigation";
import { lenisRef } from "./lenisStore";

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
            scale: 0.9,
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
      x: x * 20,
      y: y * 20,
      rotationY: x * 50,
      rotationX: -y * 50,
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
        className={`absolute top-0 right-0 transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        onClick={closeMenu}
      >
        <svg
          width="156"
          height="156"
          viewBox="0 0 156 156"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M38.8909 38.8909L116.673 116.673"
            strokeWidth="2"
            stroke="#D3FD50"
          />
          <path
            d="M38.8909 116.673L116.673 38.8909"
            strokeWidth="2"
            stroke="#D3FD50"
          />
        </svg>
      </div>
      <button
        type="button"
        className={`hamburger absolute top-0 right-0 transition-transform duration-500 ${
          isOpen ? "translate-x-full" : "translate-x-0"
        }`}
        onClick={handleClick}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Hamburger />
      </button>
    </nav>
  );
};

export default Navbar;
