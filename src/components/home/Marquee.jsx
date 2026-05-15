const WORDS = [
  "instant booking", "real keys", "stocked pantry", "no service fees",
  "live availability", "late checkout", "host on call",
];

export default function Marquee() {
  return (
    <div className="hh-marquee" aria-hidden="true">
      <div className="hh-marquee-track">
        {[...WORDS, ...WORDS].map((w, i) => (
          <span key={i} className="hh-marquee-item">
            {w}<i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}
