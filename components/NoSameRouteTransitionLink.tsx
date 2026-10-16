"use client";

import { Link as ViewTransitionLink } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";

interface NoSameRouteTransitionLinkProps
  extends React.ComponentProps<typeof ViewTransitionLink> {
  children?: React.ReactNode;
}

export default function NoSameRouteTransitionLink({
  href,
  children,
  ...props
}: NoSameRouteTransitionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target =
      typeof href === "string"
        ? href.split("?")[0].split("#")[0]
        : `${href.pathname}${href.search ?? ""}`;
    const normalizedPath = pathname.split("?")[0].split("#")[0];
    if (normalizedPath === target) {
      e.preventDefault();
      router.push(href as string);
    }
  };

  return (
    <ViewTransitionLink
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </ViewTransitionLink>
  );
}
