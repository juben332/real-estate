import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Home, Building2, MapPin, CalendarDays, Info, Phone, Star, Waves, TreePine } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { id: 1, label: "Home", key: "home" },
  {
    id: 2,
    label: "Properties",
    subMenus: [
      {
        title: "Browse",
        items: [
          { label: "All Properties",     description: "View our full collection",  icon: Building2,    key: "properties" },
          { label: "Beach & Coast",      description: "Oceanfront escapes",        icon: Waves,        key: "properties" },
          { label: "Mountain Retreats",  description: "Peaceful highland stays",   icon: TreePine,     key: "properties" },
        ],
      },
      {
        title: "Plan Your Stay",
        items: [
          { label: "Check Availability", description: "See open dates",            icon: CalendarDays, key: "properties" },
          { label: "Featured Stays",     description: "Our top-rated properties",  icon: Star,         key: "properties" },
          { label: "Locations",          description: "Explore by destination",    icon: MapPin,       key: "properties" },
        ],
      },
    ],
  },
  {
    id: 3,
    label: "About",
    key: "about",
    subMenus: [
      {
        title: "Company",
        items: [
          { label: "Our Story",    description: "How Homely began",            icon: Home,  key: "about"   },
          { label: "How It Works", description: "Book your stay in 3 steps",   icon: Info,  key: "about"   },
          { label: "Contact Us",   description: "We'd love to hear from you",  icon: Phone, key: "contact" },
        ],
      },
    ],
  },
  { id: 4, label: "Contact", key: "contact" },
];

export default function Nav({ onNav, current, isAdmin }) {
  const { user, profile } = useAuth();
  const [openMenu, setOpenMenu]   = useState(null);
  const [hoverBtn, setHoverBtn]   = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (key) => { onNav(key); setOpenMenu(null); setMobileOpen(false); };

  const NavLinks = () => (
    <>
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className="hh-nav-item"
          onMouseEnter={() => setOpenMenu(item.label)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          <button
            className={`hh-link hh-nav-btn ${current === item.key ? "is-active" : ""}`}
            onClick={() => item.key && go(item.key)}
            onMouseEnter={() => setHoverBtn(item.id)}
            onMouseLeave={() => setHoverBtn(null)}
          >
            <span>{item.label}</span>
            {item.subMenus && (
              <ChevronDown
                size={14}
                className={`hh-nav-chevron ${openMenu === item.label ? "is-open" : ""}`}
              />
            )}
            {(hoverBtn === item.id || openMenu === item.label) && (
              <motion.span
                layoutId="nav-hover-bg"
                className="hh-nav-hover-bg"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>

          <AnimatePresence>
            {openMenu === item.label && item.subMenus && (
              <motion.div
                className="hh-dropdown"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div className="hh-dropdown-inner">
                  {item.subMenus.map((sub) => (
                    <div key={sub.title} className="hh-dropdown-col">
                      <p className="hh-dropdown-group-title">{sub.title}</p>
                      <ul className="hh-dropdown-list">
                        {sub.items.map((subItem) => {
                          const Icon = subItem.icon;
                          return (
                            <li key={subItem.label}>
                              <button className="hh-dropdown-item" onClick={() => go(subItem.key)}>
                                <span className="hh-dropdown-icon"><Icon size={18} /></span>
                                <span className="hh-dropdown-text">
                                  <span className="hh-dropdown-label">{subItem.label}</span>
                                  <span className="hh-dropdown-desc">{subItem.description}</span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </>
  );

  return (
    <header className="hh-nav">

      {/* ── Left: logo ── */}
      <button className="hh-logo hh-nav-left-logo" onClick={() => go("home")}>
        <img src="/logo.svg" alt="Homely" className="hh-logo-img" />
        <span className="hh-logo-word">Homely</span>
      </button>

      {/* ── Center: nav links ── */}
      <nav className="hh-nav-center">
        <NavLinks />
      </nav>

      {/* ── Right: auth ── */}
      <div className="hh-nav-right">
        {user ? (
          <button
            className={`hh-link hh-link-cta ${current === "dashboard" ? "is-active" : ""}`}
            onClick={() => go("dashboard")}
          >
            {isAdmin ? "Admin" : profile?.name?.split(" ")[0] || "Dashboard"}
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
      </div>

      {/* ── Mobile burger ── */}
      <button className="hh-burger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
        <span /><span /><span />
      </button>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="hh-mobile-drawer"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <NavLinks />
            <div className="hh-mobile-auth">
              {user ? (
                <button className="hh-link hh-link-cta" style={{ width: "100%", textAlign: "center" }} onClick={() => go("dashboard")}>
                  {isAdmin ? "Admin" : profile?.name?.split(" ")[0] || "Dashboard"}
                </button>
              ) : (
                <>
                  <button className="hh-link hh-link-cta" style={{ width: "100%", textAlign: "center" }} onClick={() => go("properties")}>
                    Book a stay
                  </button>
                  <button className="hh-link hh-link-signin" style={{ width: "100%", textAlign: "center" }} onClick={() => go("login")}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
