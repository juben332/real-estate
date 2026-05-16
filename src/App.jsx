import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Nav from "./components/layout/Nav";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import Marquee from "./components/home/Marquee";
import AboutStrip from "./components/home/AboutStrip";
import PropertyGrid from "./components/properties/PropertyGrid";
import PropertyDetail from "./components/properties/PropertyDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ClientDashboard from "./pages/ClientDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PageHead from "./components/ui/PageHead";
import { PROPERTIES } from "./data/properties";
import { makeSeedBookings } from "./utils/seedBookings";

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [view,     setView]     = useState({ page: "home" });
  const [bookings, setBookings] = useState(() => makeSeedBookings());

  const isAdmin = profile?.role === "admin" ||
    (user?.email && user.email === import.meta.env.VITE_ADMIN_EMAIL);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const addBooking = (propId, range) => {
    setBookings((prev) => ({
      ...prev,
      [propId]: [
        ...(prev[propId] || []),
        { start: range.start, end: range.end, channel: "direct" },
      ],
    }));
  };

  const nav = (page) => {
    if (page === "dashboard" && !user) { setView({ page: "login" }); return; }
    if (page === "admin" && !isAdmin) { setView({ page: "home" }); return; }
    setView({ page });
  };

  const open = (id) => setView({ page: "property", id });

  const active = view.page === "property"
    ? PROPERTIES.find((p) => p.id === view.id)
    : null;

  if (loading) return null;

  return (
    <div className="hh-root">
      <Nav onNav={nav} current={view.page} />

      {view.page === "home" && (
        <>
          <Hero onExplore={() => nav("properties")} />
          <Marquee />
          <PropertyGrid onOpen={open} heading="Four places to land" />
          <AboutStrip onMore={() => nav("about")} />
        </>
      )}

      {view.page === "properties" && (
        <section className="hh-section">
          <PageHead
            kicker="The Collection"
            title="Every door we keep"
            sub="Four small houses, each looked after like it's our own — because it is. Live availability, instant booking."
          />
          <PropertyGrid onOpen={open} />
        </section>
      )}

      {view.page === "property" && active && (
        <PropertyDetail
          property={active}
          propertyBookings={bookings[active.id] || []}
          onAddBooking={(range) => addBooking(active.id, range)}
          onBack={() => nav("properties")}
        />
      )}

      {view.page === "about"    && <About />}
      {view.page === "contact"  && <Contact />}
      {view.page === "login"    && <Login    onNavigate={nav} />}
      {view.page === "register" && <Register onNavigate={nav} />}

      {view.page === "dashboard" && user && (
        isAdmin
          ? <AdminDashboard  onNavigate={nav} />
          : <ClientDashboard onNavigate={nav} />
      )}

      <Footer onNav={nav} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
