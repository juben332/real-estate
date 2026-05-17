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

  // Admin dashboard takes over the full screen — no site nav/footer
  if (view.page === "dashboard" && user && isAdmin) {
    return <AdminDashboard onNavigate={nav} />;
  }

  return (
    <div className="hh-root">
      <Nav onNav={nav} current={view.page} isAdmin={isAdmin} />

      {view.page === "home" && (
        <>
          <Hero onExplore={() => nav("properties")} onOpen={open} properties={properties} />
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
        <div className="hh-page-offset">
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
        </div>
      )}

      {view.page === "property" && active && (
        <div className="hh-page-offset">
          <PropertyDetail
            property={active}
            propertyBookings={bookings[active.id] || []}
            onAddBooking={fetchAvailability}
            onBack={() => nav("properties")}
          />
        </div>
      )}

      {view.page === "about"    && <div className="hh-page-offset"><About /></div>}
      {view.page === "contact"  && <div className="hh-page-offset"><Contact /></div>}
      {view.page === "login"    && <div className="hh-page-offset"><Login    onNavigate={nav} /></div>}
      {view.page === "register" && <div className="hh-page-offset"><Register onNavigate={nav} /></div>}

      {view.page === "dashboard" && user && !isAdmin && (
        <div className="hh-page-offset"><ClientDashboard onNavigate={nav} /></div>
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
