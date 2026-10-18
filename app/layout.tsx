"use client";

import "./globals.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useEffect } from "react";
import Navbar from "@/components/NavBar";
import ViewTransitionsWrapper from "@/components/ViewTransitionsWrapper";
import NavContent from "@/components/NavContent";
import Logo from "@/components/Logo";
import NoSameRouteTransitionLink from "@/components/NoSameRouteTransitionLink";
import ScrollReset from "@/components/ScrollReset";
import useScrollReset from "@/components/ScrollReset";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useScrollReset();
  useEffect(() => {
    history.scrollRestoration = "manual";
    // Prevent mobile URL bar show/hide from triggering ScrollTrigger refreshes mid-scroll
    ScrollTrigger.config({ ignoreMobileResize: true });
    const smoother = ScrollSmoother.create({
      smooth: 1,
      // Smoothing is disabled on touch by default, which leaves #smooth-wrapper
      // in-flow (not fixed/clipped) and breaks the hamburger menu animation.
      // Lower value = snappier/less janky on mobile; tweak between 0.1–0.5.
      smoothTouch: 0.5,
    });
    return () => smoother.kill();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
        <Navbar />
        <ViewTransitionsWrapper>
          <div className="logo-overlay">
            <div className="logo-blend">
              <NoSameRouteTransitionLink
                href="/"
                className="logo-link"
                aria-label="Home"
              >
                <Logo />
              </NoSameRouteTransitionLink>
            </div>
          </div>

          <NavContent />

          <div id="smooth-wrapper">
            <div id="smooth-content">
              <main>{children}</main>
            </div>
          </div>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}
