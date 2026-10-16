"use client";

import { ViewTransitions } from "next-view-transitions";

export default function ViewTransitionsWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ViewTransitions>{children}</ViewTransitions>;
}
