import Hamburger from "./Hamburger";
import Logo from "./Logo";
import NoSameRouteTransitionLink from "./NoSameRouteTransitionLink";

const Navbar = () => {
  return (
    <nav className="navbar" style={{ viewTransitionName: "navbar" }}>
      <div className="navbar-logo">
        <div className="navbar-item">
          <NoSameRouteTransitionLink href="/">
            <Logo />
          </NoSameRouteTransitionLink>
        </div>
      </div>
      <div className="hamburger">
        <Hamburger />
      </div>
    </nav>
  );
};

export default Navbar;
