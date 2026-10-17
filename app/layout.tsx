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

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    history.scrollRestoration = "manual";
    const smoother = ScrollSmoother.create({ smooth: 1 });
    return () => smoother.kill();
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
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

          <Navbar />
          <NavContent />

          <div id="smooth-wrapper">
            <div id="smooth-content">
              <ScrollReset />
              <main>{children}</main>
            </div>
          </div>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}
