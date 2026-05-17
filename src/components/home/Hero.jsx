import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";
import { PROPERTIES } from "../../data/properties";

export default function Hero({ onExplore, onOpen, properties }) {
  const cards = (properties?.length ? properties : PROPERTIES).slice(0, 3);

  return (
    <section className="hh-hero">

      {/* ── Layer 1: blueprint fades in first ── */}
      <div className="hh-hero-layer hh-hero-blueprint" style={{ backgroundImage: "url('/hero_2_blueprint.png')" }} />

      {/* ── Layer 2: clean house background ── */}
      <div className="hh-hero-layer hh-hero-clean-bg" style={{ backgroundImage: "url('/hero_1_clean.png')" }} />

      {/* ── Layer 3: brand title drops between bg and fg house ── */}
      <div className="hh-hero-brand-wrap">
        <span className="hh-hero-brand">Homely</span>
      </div>

      {/* ── Layer 4: clean house foreground — masks text behind roofline ── */}
      <div className="hh-hero-layer hh-hero-clean-fg" style={{ backgroundImage: "url('/hero_1_clean.png')" }} />

      {/* ── 3-card stacked deck ── */}
      <div className="hh-hero-stack">
        {[...cards].reverse().map((p, i) => (
          <button
            key={p.id}
            className={`hh-hero-card hh-hero-card--${i}`}
            style={{ "--c": p.hue, "--a": p.accent }}
            onClick={() => onOpen?.(p.id)}
          >
            <div className="hh-hero-card-photo">
              <PhotoMark label={p.name} />
            </div>
            <div className="hh-hero-card-body">
              {i === cards.length - 1 && <span className="hh-tag">Guest favourite</span>}
              <h3>{p.name}</h3>
              <p>{p.location}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Content: fades up after house animation ── */}
      <div className="hh-hero-content">
        <p className="hh-hero-kicker">Small-batch hospitality · est. 2019</p>
        <p className="hh-hero-sub">
          Four hand-kept houses across the East Coast.<br />
          Book directly — no front desks, no platform fees.
        </p>
        <div className="hh-hero-actions">
          <button className="hh-btn hh-btn-solid hh-btn-light" onClick={onExplore}>
            Explore the houses <Icon d={icons.arrow} />
          </button>
          <a className="hh-btn hh-btn-ghost hh-btn-ghost-light" href="#story">Our story</a>
        </div>
        <div className="hh-hero-stats">
          <div><strong>4</strong><span>houses</span></div>
          <div><strong>1,900+</strong><span>nights hosted</span></div>
          <div><strong>4.97</strong><span>avg. rating</span></div>
        </div>
      </div>

    </section>
  );
}
