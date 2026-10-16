import "./globals.css";
import "lenis/dist/lenis.css";
import ReactLenis from "lenis/react";
import Navbar from "@/components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full">
        <ReactLenis root />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
