export default function Hamburger() {
  return (
    <svg
      className="hamburger-icon"
      width="84"
      height="20"
      viewBox="0 0 42 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <symbol id="arrow" viewBox="0 0 283 209">
          <g
            fill="none"
            fillRule="evenodd"
            strokeLinecap="square"
            strokeWidth="3"
            transform="rotate(-180 140.5 103.5)"
            style={{ mixBlendMode: "difference" }}
          >
            <line x1=".758" x2="100.561" y1="101.409" y2=".182" />
            <line x1="2.75" x2="279.021" y1="103.182" y2="103.182" />
            <line x1=".758" x2="101.637" y1="102.943" y2="204.182" />
          </g>
        </symbol>

        <symbol id="burger" viewBox="0 0 63 10">
          <g
            fill="none"
            fillRule="evenodd"
            strokeLinecap="square"
            strokeWidth="2"
            transform="translate(1 1)"
          >
            <line
              className="hamburger-line hamburger-line-1"
              x1=".355"
              x2="60.645"
              y1=".5"
              y2=".5"
              stroke="currentColor"
            />
            <line
              className="hamburger-line hamburger-line-2"
              x1="30.5"
              x2="60.645"
              y1="7.5"
              y2="7.5"
              stroke="currentColor"
            />
          </g>
        </symbol>

        <symbol id="close" viewBox="0 0 139 139">
          <g
            fill="none"
            fillRule="evenodd"
            strokeLinecap="square"
            strokeWidth="3"
            transform="translate(3 2)"
          >
            <line x1="1" x2="132.291" y1="134" y2="1" />
            <line x2="133" y1="1" y2="132" />
          </g>
        </symbol>

        {/* Add the remaining symbols from your original SVG
            here: big-arrow, globe, happy, heart, logo,
            quote, and quote-fr. */}
      </defs>

      <use
        href="#burger"
        className="hamburger-symbol"
        x="0"
        y="0"
        width="42"
        height="10"
      />
    </svg>
  );
}
