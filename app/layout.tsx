import "./globals.css";
import "lenis/dist/lenis.css";
import ReactLenis from "lenis/react";
import Navbar from "@/components/NavBar";
import { ViewTransition } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
        <ViewTransition enter="page-enter" exit="page-exit" default="none">
          <ReactLenis root />
          <Navbar />
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
