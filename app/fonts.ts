import localFont from "next/font/local";

// Fonts live in /public/fonts and load through next/font, which self-hosts
// them with hashed URLs, preloads them, and generates size-adjusted fallbacks.

export const druk = localFont({
  src: "../public/fonts/druk-condensed-super.woff2",
  display: "swap",
  variable: "--ds-font-druk",
});

export const shareTechMono = localFont({
  src: "../public/fonts/share-tech-mono.woff2",
  display: "swap",
  variable: "--ds-font-caption",
});
