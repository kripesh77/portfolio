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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  useEffect(() => {
    history.scrollRestoration = "manual";
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

          <div className="main-shell">
            <ReactLenis
              className="main-scroll"
              ref={(handle) => {
                // ReactLenis re-attaches this ref once the instance is created
                // (useImperativeHandle depends on [lenis]), so the callback
                // fires again with the populated handle.
                lenisRef.current = handle?.lenis ?? null;
              }}
            >
              <ScrollReset />
              <main>{children}</main>
            </ReactLenis>
          </div>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}
