import { useState, useEffect, useCallback } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";
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

function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [view,       setView]       = useState({ page: "home" });
  const [properties, setProperties] = useState([]);
  const [bookings,   setBookings]   = useState({});
  const [propLoading, setPropLoading] = useState(true);

  const isAdmin = profile?.role === "admin" ||
    (user?.email && user.email === import.meta.env.VITE_ADMIN_EMAIL);

  // Fetch active properties from Supabase
  useEffect(() => {
    supabase
      .from("properties")
      .select("*")
      .eq("active", true)
      .order("created_at")
      .then(({ data }) => {
        setProperties(data || []);
        setPropLoading(false);
      });
  }, []);

  // Fetch confirmed booking date ranges for all properties (for calendar blocking)
  const fetchAvailability = useCallback(async () => {
    const { data } = await supabase
      .from("property_availability")
      .select("property_id, range_start, range_end");

    const grouped = {};
    (data || []).forEach((b) => {
      if (!grouped[b.property_id]) grouped[b.property_id] = [];
      grouped[b.property_id].push({
        start: b.range_start,
        end:   b.range_end,
        channel: "direct",
      });
    });
    setBookings(grouped);
  }, []);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const nav = (page) => {
    if (page === "dashboard" && !user) { setView({ page: "login" }); return; }
    if (page === "admin" && !isAdmin)  { setView({ page: "home"  }); return; }
    setView({ page });
  };

  const open = (id) => setView({ page: "property", id });

  const active = view.page === "property"
    ? properties.find((p) => p.id === view.id)
    : null;

  if (authLoading) return null;

  return (
    <div className="hh-root">
      <Nav onNav={nav} current={view.page} isAdmin={isAdmin} />

      {view.page === "home" && (
        <>
          <Hero onExplore={() => nav("properties")} />
          <Marquee />
          <PropertyGrid
            properties={properties}
            loading={propLoading}
            onOpen={open}
            heading="Four places to land"
          />
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
          <PropertyGrid
            properties={properties}
            loading={propLoading}
            onOpen={open}
          />
        </section>
      )}

      {view.page === "property" && active && (
        <PropertyDetail
          property={active}
          propertyBookings={bookings[active.id] || []}
          onAddBooking={fetchAvailability}
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
