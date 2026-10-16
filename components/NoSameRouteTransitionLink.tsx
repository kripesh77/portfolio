"use client";

import { Link as ViewTransitionLink } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";

interface NoSameRouteTransitionLinkProps extends React.ComponentProps<
  typeof ViewTransitionLink
> {
  children?: React.ReactNode;
  onNavigate?: () => void;
}

export default function NoSameRouteTransitionLink({
  href,
  children,
  onNavigate,
  onClick,
  ...props
}: NoSameRouteTransitionLinkProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);

    if (e.defaultPrevented) return;

    onNavigate?.();

    const target =
      typeof href === "string"
        ? href.split("?")[0].split("#")[0]
        : href.pathname;

    if (pathname === target) {
      e.preventDefault();

      router.push(
        typeof href === "string"
          ? href
          : `${href.pathname ?? "/"}${href.search ?? ""}${href.hash ?? ""}`,
      );
    }
  };

  return (
    <ViewTransitionLink href={href} onClick={handleClick} {...props}>
      {children}
    </ViewTransitionLink>
  );
}
