import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Building2, MapPin, CalendarDays, Info, Phone, Star, Waves, TreePine, Home } from "lucide-react";
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
          { label: "Our Story",    description: "How Homely began",           icon: Home,  key: "about"   },
          { label: "How It Works", description: "Book your stay in 3 steps",  icon: Info,  key: "about"   },
          { label: "Contact Us",   description: "We'd love to hear from you", icon: Phone, key: "contact" },
        ],
      },
    ],
  },
  { id: 4, label: "Contact", key: "contact" },
];

export default function Nav({ onNav, current, isAdmin }) {
  const { user, profile } = useAuth();
  const [openMenu, setOpenMenu]     = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const closeTimer = useRef(null);

  const openNav  = (label) => { clearTimeout(closeTimer.current); setOpenMenu(label); };
  const closeNav = ()      => { closeTimer.current = setTimeout(() => setOpenMenu(null), 200); };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isScrolled = current !== "home" || scrolled;
  const go = (key) => { onNav(key); setOpenMenu(null); setMobileOpen(false); };

  const NavLinks = ({ mobile = false }) => (
    <>
      {NAV_ITEMS.map((item) => (
        <div
          key={item.id}
          className="hh-nav-item"
          onMouseEnter={() => !mobile && openNav(item.label)}
          onMouseLeave={() => !mobile && closeNav()}
        >
          <button
            className={`hh-navlink ${current === item.key ? "is-active" : ""} ${mobile ? "is-mobile" : ""}`}
            onClick={() => { item.key && go(item.key); mobile && item.subMenus && openNav(openMenu === item.label ? null : item.label); }}
          >
            <span>{item.label}</span>
            {item.subMenus && (
              <ChevronDown size={13} className={`hh-nav-chevron ${openMenu === item.label ? "is-open" : ""}`} />
            )}
          </button>

          <AnimatePresence>
            {openMenu === item.label && item.subMenus && (
              <motion.div
                className="hh-dropdown"
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onMouseEnter={() => clearTimeout(closeTimer.current)}
                onMouseLeave={closeNav}
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
                                <span className="hh-dropdown-icon"><Icon size={16} /></span>
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
    <>
      <header className={`hh-nav ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="hh-nav-island">

          {/* Logo */}
          <button className="hh-logo" onClick={() => go("home")}>
            <img src="/logo.svg" alt="Homely" className="hh-logo-img" />
            <span className="hh-logo-word">Homely</span>
          </button>

          <span className="hh-nav-sep" />

          {/* Desktop links */}
          <nav className="hh-nav-links">
            <NavLinks />
          </nav>

          {/* Desktop auth */}
          <div className="hh-nav-actions">
            {user ? (
              <button
                className={`hh-nav-book ${current === "dashboard" ? "is-active" : ""}`}
                onClick={() => go("dashboard")}
              >
                {isAdmin ? "Admin" : profile?.name?.split(" ")[0] || "Dashboard"}
              </button>
            ) : (
              <>
                <button className="hh-nav-book" onClick={() => go("properties")}>Book a stay</button>
                <button className="hh-link-signin" onClick={() => go("login")}>Sign in</button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className={`hh-burger ${mobileOpen ? "is-open" : ""}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>

        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="hh-mobile-drawer"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <NavLinks mobile />
            <div className="hh-mobile-auth">
              {user ? (
                <button className="hh-nav-book" style={{ width: "100%", justifyContent: "center" }} onClick={() => go("dashboard")}>
                  {isAdmin ? "Admin" : profile?.name?.split(" ")[0] || "Dashboard"}
                </button>
              ) : (
                <>
                  <button className="hh-nav-book" style={{ width: "100%", justifyContent: "center" }} onClick={() => go("properties")}>
                    Book a stay
                  </button>
                  <button className="hh-link-signin" style={{ width: "100%", textAlign: "center" }} onClick={() => go("login")}>
                    Sign in
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
