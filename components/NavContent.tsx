import NoSameRouteTransitionLink from "./NoSameRouteTransitionLink";

export default function NavContent() {
  return (
    <div className="navcontent">
      <NoSameRouteTransitionLink href="/projects">
        projects
      </NoSameRouteTransitionLink>
      <NoSameRouteTransitionLink href="/info">info</NoSameRouteTransitionLink>
    </div>
  );
}
