import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { prettyDate } from "../utils/dateHelpers";
import Icon, { icons } from "../components/ui/Icon";

/* ─────────────────── OVERVIEW ─────────────────── */
function Overview({ onNav }) {
  const [stats,  setStats]  = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      supabase.from("bookings").select("total, status"),
      supabase.from("properties").select("id, active"),
      supabase.from("profiles").select("id"),
      supabase.from("bookings_detail").select("*").order("created_at", { ascending: false }).limit(5),
    ]).then(([bRes, pRes, uRes, rRes]) => {
      const all = bRes.data || [];
      const paid = all.filter((b) => b.status === "confirmed" || b.status === "completed");
      setStats({
        revenue:    paid.reduce((s, b) => s + Number(b.total), 0),
        bookings:   all.length,
        active:     (pRes.data || []).filter((p) => p.active).length,
        users:      (uRes.data || []).length,
        cancelled:  all.filter((b) => b.status === "cancelled").length,
      });
      setRecent(rRes.data || []);
    });
  }, []);

  if (!stats) return <div className="ap-empty">Loading overview…</div>;

  return (
    <div>
      <div className="ap-stats-grid">
        <div className="ap-stat-card ap-stat-revenue">
          <span className="ap-stat-label">Total Revenue</span>
          <strong className="ap-stat-value">${stats.revenue.toLocaleString()}</strong>
          <span className="ap-stat-sub">confirmed + completed</span>
        </div>
        <div className="ap-stat-card">
          <span className="ap-stat-label">Total Bookings</span>
          <strong className="ap-stat-value">{stats.bookings}</strong>
          <span className="ap-stat-sub">{stats.cancelled} cancelled</span>
        </div>
        <div className="ap-stat-card">
          <span className="ap-stat-label">Active Properties</span>
          <strong className="ap-stat-value">{stats.active}</strong>
          <span className="ap-stat-sub">currently listed</span>
        </div>
        <div className="ap-stat-card">
          <span className="ap-stat-label">Registered Users</span>
          <strong className="ap-stat-value">{stats.users}</strong>
          <span className="ap-stat-sub">all time</span>
        </div>
      </div>

      <div className="ap-section-header" style={{ marginTop: "2rem" }}>
        <h3 className="ap-section-title">Recent Bookings</h3>
        <button className="ap-link-btn" onClick={() => onNav("bookings")}>View all →</button>
      </div>

      {recent.length === 0 ? (
        <p className="ap-empty">No bookings yet.</p>
      ) : (
        <div className="hh-dash-table-wrap">
          <table className="hh-dash-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Property</th>
                <th>Dates</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.guest_name || "Guest"}</strong>
                    <span className="hh-table-sub">{b.guest_email}</span>
                  </td>
                  <td>{b.property_name ?? b.property_id}</td>
                  <td>{prettyDate(b.range_start)} → {prettyDate(b.range_end)}</td>
                  <td>${Number(b.total).toLocaleString()}</td>
                  <td><span className={`hh-status hh-status-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── BOOKINGS ─────────────────── */
function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");

  const fetch = useCallback(async () => {
    setLoading(true);
    const q = supabase.from("bookings_detail").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q.eq("status", filter);
    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const setStatus = async (id, status) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetch();
  };

  const FILTERS = ["all", "confirmed", "cancelled", "completed"];

  return (
    <div>
      <div className="ap-section-header">
        <h3 className="ap-section-title">All Bookings</h3>
        <div className="ap-filter-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`ap-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="ap-empty">Loading…</p>
      ) : bookings.length === 0 ? (
        <p className="ap-empty">No bookings found.</p>
      ) : (
        <div className="hh-dash-table-wrap">
          <table className="hh-dash-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Property</th>
                <th>Dates</th>
                <th>Nights</th>
                <th>Total</th>
                <th>Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className={b.status === "cancelled" ? "hh-row-cancelled" : ""}>
                  <td>
                    <strong>{b.guest_name || "Guest"}</strong>
                    <span className="hh-table-sub">{b.guest_email}</span>
                  </td>
                  <td>
                    <strong>{b.property_name ?? b.property_id}</strong>
                    <span className="hh-table-sub">{b.property_location}</span>
                  </td>
                  <td>{prettyDate(b.range_start)} → {prettyDate(b.range_end)}</td>
                  <td>{b.nights}</td>
                  <td>${Number(b.total).toLocaleString()}</td>
                  <td><code style={{ fontSize: "0.8rem" }}>{b.confirmation_code}</code></td>
                  <td><span className={`hh-status hh-status-${b.status}`}>{b.status}</span></td>
                  <td className="hh-table-actions">
                    {b.status === "confirmed" && (
                      <>
                        <button className="hh-btn-ghost hh-btn-danger" onClick={() => setStatus(b.id, "cancelled")}>Cancel</button>
                        <button className="hh-btn-ghost" onClick={() => setStatus(b.id, "completed")}>Complete</button>
                      </>
                    )}
                    {b.status === "cancelled" && (
                      <button className="hh-btn-ghost" onClick={() => setStatus(b.id, "confirmed")}>Restore</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── PROPERTY FORM ─────────────────── */
const EMPTY_PROP = {
  id: "", name: "", location: "", price: "", beds: 1, baths: 1, guests: 2,
  tagline: "", blurb: "", hue: "#2A3B2D", accent: "#C4622D", active: true, amenities: "",
};

function PropertyForm({ initial, onSave, onCancel }) {
  const [form,   setForm]   = useState(() => {
    if (!initial) return EMPTY_PROP;
    return { ...initial, amenities: Array.isArray(initial.amenities) ? initial.amenities.join(", ") : "" };
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const amenities = form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const payload = {
        name:     form.name,
        location: form.location,
        price:    Number(form.price),
        beds:     Number(form.beds),
        baths:    Number(form.baths),
        guests:   Number(form.guests),
        tagline:  form.tagline,
        blurb:    form.blurb,
        hue:      form.hue,
        accent:   form.accent,
        active:   form.active,
        amenities,
      };
      if (initial) {
        const { error: err } = await supabase.from("properties").update(payload).eq("id", initial.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from("properties").insert({ ...payload, id: form.id });
        if (err) throw err;
      }
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="ap-prop-form">
      <div className="ap-prop-form-grid">
        {!initial && (
          <div className="hh-form-group">
            <label>ID / slug <span className="ap-hint">(e.g. "pine")</span></label>
            <input className="hh-form-input" value={form.id} onChange={(e) => set("id", e.target.value)} required placeholder="pine-loft" />
          </div>
        )}
        <div className="hh-form-group">
          <label>Property Name</label>
          <input className="hh-form-input" value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="The Pine Loft" />
        </div>
        <div className="hh-form-group">
          <label>Location</label>
          <input className="hh-form-input" value={form.location} onChange={(e) => set("location", e.target.value)} required placeholder="Asheville, North Carolina" />
        </div>
        <div className="hh-form-group">
          <label>Price / night ($)</label>
          <input type="number" className="hh-form-input" value={form.price} onChange={(e) => set("price", e.target.value)} required min={1} />
        </div>
        <div className="hh-form-group">
          <label>Bedrooms</label>
          <input type="number" className="hh-form-input" value={form.beds} onChange={(e) => set("beds", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group">
          <label>Bathrooms</label>
          <input type="number" className="hh-form-input" value={form.baths} onChange={(e) => set("baths", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group">
          <label>Max Guests</label>
          <input type="number" className="hh-form-input" value={form.guests} onChange={(e) => set("guests", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group ap-full">
          <label>Tagline</label>
          <input className="hh-form-input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} placeholder="A short catchy line" />
        </div>
        <div className="hh-form-group ap-full">
          <label>Description</label>
          <textarea className="hh-form-input hh-form-textarea" rows={3} value={form.blurb} onChange={(e) => set("blurb", e.target.value)} placeholder="Describe the property…" />
        </div>
        <div className="hh-form-group ap-full">
          <label>Amenities <span className="ap-hint">(comma-separated)</span></label>
          <input className="hh-form-input" value={form.amenities} onChange={(e) => set("amenities", e.target.value)} placeholder="Wi-Fi, Kitchen, EV charger, Hot tub" />
        </div>
        <div className="hh-form-group">
          <label>Theme Color</label>
          <input type="color" className="hh-form-input hh-color-input" value={form.hue} onChange={(e) => set("hue", e.target.value)} />
        </div>
        <div className="hh-form-group">
          <label>Accent Color</label>
          <input type="color" className="hh-form-input hh-color-input" value={form.accent} onChange={(e) => set("accent", e.target.value)} />
        </div>
        <div className="hh-form-group">
          <label>Status</label>
          <select className="hh-form-input" value={form.active ? "active" : "hidden"} onChange={(e) => set("active", e.target.value === "active")}>
            <option value="active">Active — visible on site</option>
            <option value="hidden">Hidden — not listed</option>
          </select>
        </div>
      </div>

      {/* Live preview swatch */}
      <div className="ap-color-preview" style={{ background: form.hue, borderColor: form.accent }}>
        <span style={{ color: form.accent }}>●</span> {form.name || "Property Name"}
      </div>

      {error && <p className="hh-pay-error">{error}</p>}
      <div className="ap-form-actions">
        <button type="button" className="hh-btn hh-btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="hh-btn hh-btn-solid" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add property"}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────── PROPERTIES ─────────────────── */
function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [view,       setView]       = useState("list"); // list | add | edit
  const [editing,    setEditing]    = useState(null);

  const fetch = async () => {
    const { data } = await supabase.from("properties").select("*").order("created_at");
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabase.from("properties").delete().eq("id", id);
    fetch();
  };

  const toggle = async (id, active) => {
    await supabase.from("properties").update({ active: !active }).eq("id", id);
    fetch();
  };

  if (view === "add" || view === "edit") {
    return (
      <div>
        <div className="ap-section-header">
          <h3 className="ap-section-title">{view === "add" ? "Add New Property" : `Edit: ${editing?.name}`}</h3>
        </div>
        <PropertyForm
          initial={view === "edit" ? editing : null}
          onSave={() => { setView("list"); setEditing(null); fetch(); }}
          onCancel={() => { setView("list"); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="ap-section-header">
        <h3 className="ap-section-title">{properties.length} Properties</h3>
        <button className="hh-btn hh-btn-solid" onClick={() => setView("add")}>+ Add property</button>
      </div>

      {loading ? (
        <p className="ap-empty">Loading…</p>
      ) : (
        <div className="ap-prop-grid">
          {properties.map((p) => (
            <div key={p.id} className={`ap-prop-card ${!p.active ? "is-hidden" : ""}`} style={{ "--c": p.hue, "--a": p.accent }}>
              <div className="ap-prop-card-banner">
                <span className="ap-prop-card-id">{p.id}</span>
                <span className={`hh-status hh-status-${p.active ? "confirmed" : "cancelled"}`}>
                  {p.active ? "Active" : "Hidden"}
                </span>
              </div>
              <div className="ap-prop-card-body">
                <h4 className="ap-prop-card-name">{p.name}</h4>
                <p className="ap-prop-card-loc">{p.location}</p>
                <div className="ap-prop-card-specs">
                  <span>${p.price}/night</span>
                  <span>{p.beds}bd · {p.baths}ba · {p.guests} guests</span>
                </div>
                {p.amenities?.length > 0 && (
                  <p className="ap-prop-card-amenities">
                    {p.amenities.slice(0, 3).join(" · ")}{p.amenities.length > 3 ? ` +${p.amenities.length - 3}` : ""}
                  </p>
                )}
              </div>
              <div className="ap-prop-card-actions">
                <button className="hh-btn-ghost" onClick={() => { setEditing(p); setView("edit"); }}>Edit</button>
                <button className="hh-btn-ghost" onClick={() => toggle(p.id, p.active)}>
                  {p.active ? "Hide" : "Show"}
                </button>
                <button className="hh-btn-ghost hh-btn-danger" onClick={() => del(p.id, p.name)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── USERS ─────────────────── */
function Users() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const setRole = async (id, role) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  return (
    <div>
      <div className="ap-section-header">
        <h3 className="ap-section-title">{users.length} Users</h3>
      </div>

      {loading ? (
        <p className="ap-empty">Loading…</p>
      ) : users.length === 0 ? (
        <p className="ap-empty">No users yet.</p>
      ) : (
        <div className="hh-dash-table-wrap">
          <table className="hh-dash-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.name || "—"}</strong></td>
                  <td>{u.email}</td>
                  <td>{u.phone || <span style={{ color: "#aaa" }}>—</span>}</td>
                  <td>
                    <span className={`hh-status hh-status-${u.role === "admin" ? "confirmed" : "pending"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.role === "client" ? (
                      <button className="hh-btn-ghost" onClick={() => setRole(u.id, "admin")}>Make admin</button>
                    ) : (
                      <button className="hh-btn-ghost hh-btn-danger" onClick={() => setRole(u.id, "client")}>Revoke admin</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── SIDEBAR NAV ─────────────────── */
const NAV_ITEMS = [
  { key: "overview",    label: "Overview",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { key: "bookings",   label: "Bookings",    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { key: "properties", label: "Properties",  icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { key: "users",      label: "Users",       icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
];

/* ─────────────────── MAIN ADMIN SHELL ─────────────────── */
export default function AdminDashboard({ onNavigate }) {
  const { user, signOut } = useAuth();
  const [page,       setPage]       = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    onNavigate("home");
  };

  const go = (p) => { setPage(p); setSidebarOpen(false); };

  return (
    <div className="ap-shell">
      {/* ── Sidebar ── */}
      <aside className={`ap-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="ap-sidebar-brand">
          <span className="ap-sidebar-mark">H&amp;H</span>
          <div>
            <span className="ap-sidebar-title">Admin</span>
            <span className="ap-sidebar-email">{user?.email}</span>
          </div>
        </div>

        <nav className="ap-sidebar-nav">
          {NAV_ITEMS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`ap-nav-item ${page === key ? "is-active" : ""}`}
              onClick={() => go(key)}
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
              </svg>
              {label}
            </button>
          ))}
        </nav>

        <div className="ap-sidebar-footer">
          <button className="ap-footer-btn" onClick={() => onNavigate("home")}>
            ← Back to site
          </button>
          <button className="ap-footer-btn ap-footer-btn-danger" onClick={handleSignOut}>
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="ap-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <div className="ap-main">
        <header className="ap-topbar">
          <button className="ap-burger" onClick={() => setSidebarOpen((o) => !o)} aria-label="Menu">
            <span /><span /><span />
          </button>
          <h1 className="ap-page-title">
            {NAV_ITEMS.find((n) => n.key === page)?.label}
          </h1>
        </header>

        <div className="ap-content">
          {page === "overview"    && <Overview    onNav={go} />}
          {page === "bookings"    && <Bookings />}
          {page === "properties"  && <Properties />}
          {page === "users"       && <Users />}
        </div>
      </div>
    </div>
  );
}
