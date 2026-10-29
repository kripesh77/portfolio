export default function Hamburger() {
  return (
    <svg
      width="36"
      height="16"
      viewBox="0 0 36 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{
        display: "block",
        width: "36px",
        height: "16px",
        flexShrink: 0,
      }}
    >
      <path
        d="M1 15H35"
        strokeWidth="2"
        strokeLinecap="square"
        stroke="var(--ds-color-bg)"
      />
      <path
        d="M1 8H35"
        strokeWidth="2"
        strokeLinecap="square"
        stroke="var(--ds-color-bg)"
      />
      <path
        d="M1 1H35"
        strokeWidth="2"
        strokeLinecap="square"
        stroke="var(--ds-color-bg)"
      />
    </svg>
  );
}
