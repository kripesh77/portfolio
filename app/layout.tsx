"use client";

import "./globals.css";
import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import { useEffect } from "react";
import Navbar from "@/components/NavBar";
import ViewTransitionsWrapper from "@/components/ViewTransitionsWrapper";
import NavContent from "@/components/NavContent";
import Logo from "@/components/Logo";
import NoSameRouteTransitionLink from "@/components/NoSameRouteTransitionLink";
import ScrollReset from "@/components/ScrollReset";
import { lenisRef } from "@/components/lenisStore";
import DataEffects from "@/components/DataEffects";
import LenisGsapSync from "@/components/LenisGsapSync";
import Footer from "@/components/Footer";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import localFont from "next/font/local";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

const geographFont = localFont({
  src: [
    {
      path: "../public/fonts/geograph-regular.woff2",
      weight: "400",
    },
    {
      path: "../public/fonts/geograph-medium.woff2",
      weight: "500",
    },
    {
      path: "../public/fonts/geograph-bold.woff2",
      weight: "700",
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  return (
    <html lang="en" suppressHydrationWarning className={geographFont.className}>
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

          <div className="main-shell">
            <ReactLenis
              options={{ autoRaf: false }}
              className="main-scroll"
              ref={(handle) => {
                lenisRef.current = handle?.lenis ?? null;
              }}
            >
              <ScrollReset />
              <LenisGsapSync />
              <DataEffects />
              <main>{children}</main>
              <Footer />
            </ReactLenis>
          </div>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}
