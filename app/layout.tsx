import "./globals.css";
import "lenis/dist/lenis.css";
import ReactLenis from "lenis/react";
import Navbar from "@/components/NavBar";
import ViewTransitionsWrapper from "@/components/ViewTransitionsWrapper";
import NavContent from "@/components/NavContent";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
        <ViewTransitionsWrapper>
          <ReactLenis root />
          <Navbar />
          <NavContent />
          <main>{children}</main>
        </ViewTransitionsWrapper>
      </body>
    </html>
  );
}
