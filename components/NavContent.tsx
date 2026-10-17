import NoSameRouteTransitionLink from "./NoSameRouteTransitionLink";

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
