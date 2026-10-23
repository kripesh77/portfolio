"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import NoSameRouteTransitionLink from "./NoSameRouteTransitionLink";

gsap.registerPlugin(useGSAP, SplitText);

export default function NavContent() {
  return (
    <div className="navcontent">
      <div>
        <NoSameRouteTransitionLink href="/projects">
          projects
        </NoSameRouteTransitionLink>

        <NoSameRouteTransitionLink href="/info">info</NoSameRouteTransitionLink>
      </div>
    </div>
  );
}
