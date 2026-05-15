export default function PhotoMark({ label, alt }) {
  return (
    <div className={`hh-photomark ${alt ? "is-alt" : ""}`}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="hh-photomark-bg">
        <defs>
          <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="var(--a)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--c)" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g-${label})`} />
        <circle cx={alt ? 30 : 72} cy={alt ? 34 : 30} r="14" fill="#fff" opacity="0.16" />
        <path d="M0 78 L28 52 L46 68 L70 40 L100 70 L100 100 L0 100 Z" fill="#000" opacity="0.18" />
        <path d="M0 86 L24 66 L44 80 L72 56 L100 82 L100 100 L0 100 Z" fill="#fff" opacity="0.10" />
      </svg>
      <span className="hh-photomark-label">{label}</span>
    </div>
  );
}
