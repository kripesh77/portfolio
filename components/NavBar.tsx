"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Hamburger from "./Hamburger";
import { usePathname } from "next/navigation";

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
    }
  }, [pathname]);

  function closeMenu() {
    timeline.current?.reverse();
    isOpenRef.current = false;
    setIsOpen(false);
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
    } else {
      timeline.current.play();
    }

    isOpenRef.current = !isOpenRef.current;
    setIsOpen(isOpenRef.current);
  }

  return (
    <nav className="navbar">
      <button
        type="button"
        className="hamburger"
        onClick={handleClick}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <Hamburger />
      </button>
    </nav>
  );
};

export default Navbar;
