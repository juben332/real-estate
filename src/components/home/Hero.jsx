import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";
import { PROPERTIES } from "../../data/properties";

export default function Hero({ onExplore }) {
  return (
    <section className="hh-hero">
      <div className="hh-hero-grain" />
      <div className="hh-hero-inner">
        <p className="hh-hero-kicker">Small-batch hospitality · est. 2019</p>
        <h1 className="hh-hero-title">
          Stay somewhere<br />
          <em>actually</em> looked after.
        </h1>
        <p className="hh-hero-sub">
          Four hand-kept houses across the East Coast. Check live availability and book
          directly with us in under a minute — no front desks, no platform fees.
        </p>
        <div className="hh-hero-actions">
          <button className="hh-btn hh-btn-solid" onClick={onExplore}>
            Explore the houses <Icon d={icons.arrow} />
          </button>
          <a className="hh-btn hh-btn-ghost" href="#story">Our story</a>
        </div>
        <div className="hh-hero-stats">
          <div><strong>4</strong><span>houses</span></div>
          <div><strong>1,900+</strong><span>nights hosted</span></div>
          <div><strong>4.97</strong><span>avg. rating</span></div>
        </div>
      </div>

      <div className="hh-hero-card" style={{ "--c": PROPERTIES[0].hue, "--a": PROPERTIES[0].accent }}>
        <div className="hh-hero-card-photo">
          <PhotoMark label={PROPERTIES[0].name} />
        </div>
        <div className="hh-hero-card-body">
          <span className="hh-tag">Guest favourite</span>
          <h3>{PROPERTIES[0].name}</h3>
          <p>{PROPERTIES[0].location}</p>
        </div>
      </div>
    </section>
  );
}
