import { PROPERTIES } from "../../data/properties";

export default function Footer({ onNav }) {
  return (
    <footer className="hh-footer">
      <div className="hh-footer-top">
        <div className="hh-footer-brand">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo.svg" alt="Homely" style={{ width: 36, height: 36 }} />
            <span style={{ fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 500, color: "var(--cream)" }}>Homely</span>
          </div>
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
            <div className="hh-footer-socials">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hh-footer-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hh-footer-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="hh-footer-social-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34l-.01-8.74a8.16 8.16 0 0 0 4.77 1.52V4.64a4.85 4.85 0 0 1-1-.05z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="hh-footer-base">
        <span>© {new Date().getFullYear()} Homely Rentals</span>
        <span>Built with care — demo site</span>
      </div>
    </footer>
  );
}
