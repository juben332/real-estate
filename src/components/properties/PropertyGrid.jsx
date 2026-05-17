import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";

export default function PropertyGrid({ properties = [], loading, onOpen, heading }) {
  return (
    <section className="hh-grid-wrap">
      {heading && (
        <div className="hh-grid-head">
          <h2 className="hh-h2">{heading}</h2>
          <p className="hh-grid-head-note">Prices are nightly, all-in. What you see is what you pay.</p>
        </div>
      )}
      {loading ? (
        <div className="hh-grid-loading">Loading properties…</div>
      ) : (
        <div className="hh-grid">
          {properties.map((p, i) => (
            <article
              key={p.id}
              className="hh-card"
              style={{ "--c": p.hue, "--a": p.accent, animationDelay: `${i * 90}ms` }}
              onClick={() => onOpen(p.id)}
            >
              <div className="hh-card-photo">
                {p.image
                  ? <img src={p.image} alt={p.name} className="hh-card-img" />
                  : <PhotoMark label={p.name} />}
                <span className="hh-card-price">${p.price}<i>/night</i></span>
              </div>
              <div className="hh-card-body">
                <div className="hh-card-loc">
                  <Icon d={icons.pin} size={14} /> {p.location}
                </div>
                <h3 className="hh-card-name">{p.name}</h3>
                <p className="hh-card-tag">{p.tagline}</p>
                <div className="hh-card-meta">
                  <span><Icon d={icons.guest} size={15} /> {p.guests}</span>
                  <span><Icon d={icons.bed}   size={15} /> {p.beds}</span>
                  <span><Icon d={icons.bath}  size={15} /> {p.baths}</span>
                  <span className="hh-card-go">Book <Icon d={icons.arrow} size={15} /></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
