import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const LINKS = [
  ["home",       "Home"],
  ["properties", "Properties"],
  ["about",      "About"],
  ["contact",    "Contact"],
];

export default function Nav({ onNav, current }) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);

  const go = (page) => {
    onNav(page);
    setOpen(false);
  };

  return (
    <header className="hh-nav">
      <button className="hh-logo" onClick={() => go("home")}>
        <span className="hh-logo-mark">H<span>&</span>H</span>
        <span className="hh-logo-word">Hearth &amp; Hollow</span>
      </button>

      <nav className={`hh-links ${open ? "is-open" : ""}`}>
        {LINKS.map(([key, label]) => (
          <button
            key={key}
            className={`hh-link ${current === key ? "is-active" : ""}`}
            onClick={() => go(key)}
          >
            {label}
          </button>
        ))}

        {user ? (
          <button
            className={`hh-link hh-link-cta ${current === "dashboard" ? "is-active" : ""}`}
            onClick={() => go("dashboard")}
          >
            {profile?.role === "admin" ? "Admin" : profile?.name?.split(" ")[0] || "Dashboard"}
          </button>
        ) : (
          <>
            <button className="hh-link hh-link-cta" onClick={() => go("properties")}>
              Book a stay
            </button>
            <button className="hh-link hh-link-signin" onClick={() => go("login")}>
              Sign in
            </button>
          </>
        )}
      </nav>

      <button className="hh-burger" onClick={() => setOpen((o) => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>
    </header>
  );
}
