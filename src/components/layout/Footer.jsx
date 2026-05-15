import { PROPERTIES } from "../../data/properties";

export default function Footer({ onNav }) {
  return (
    <footer className="hh-footer">
      <div className="hh-footer-top">
        <div className="hh-footer-brand">
          <span className="hh-logo-mark">H<span>&</span>H</span>
          <p>Small-batch hospitality on the East Coast. Four houses, kept by hand since 2019.</p>
        </div>
        <div className="hh-footer-cols">
          <div>
            <h4>Visit</h4>
            <button onClick={() => onNav("properties")}>Properties</button>
            <button onClick={() => onNav("about")}>Our story</button>
            <button onClick={() => onNav("contact")}>Contact</button>
          </div>
          <div>
            <h4>The houses</h4>
            {PROPERTIES.map((p) => (
              <button key={p.id} onClick={() => onNav("properties")}>{p.name}</button>
            ))}
          </div>
          <div>
            <h4>Reach us</h4>
            <a href="mailto:stay@hearthandhollow.co">stay@hearthandhollow.co</a>
            <a href="tel:+18285550174">+1 (828) 555-0174</a>
          </div>
        </div>
      </div>
      <div className="hh-footer-base">
        <span>© {new Date().getFullYear()} Hearth &amp; Hollow Rentals</span>
        <span>Built with care — demo site</span>
      </div>
    </footer>
  );
}
