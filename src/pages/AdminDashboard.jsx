import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { prettyDate } from "../utils/dateHelpers";

/* ─── All Bookings ─── */
function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, profiles(name), properties(name, location)")
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, []);

  const updateStatus = async (id, status) => {
    await supabase.from("bookings").update({ status }).eq("id", id);
    fetchBookings();
  };

  if (loading) return <p className="hh-dash-empty">Loading…</p>;
  if (!bookings.length) return <p className="hh-dash-empty">No bookings yet.</p>;

  return (
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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className={b.status === "cancelled" ? "hh-row-cancelled" : ""}>
              <td>{b.profiles?.name || "Guest"}</td>
              <td>
                <strong>{b.properties?.name ?? b.property_id}</strong>
                <span className="hh-table-sub">{b.properties?.location}</span>
              </td>
              <td>{prettyDate(b.range_start)} → {prettyDate(b.range_end)}</td>
              <td>{b.nights}</td>
              <td>${b.total?.toLocaleString()}</td>
              <td><code>{b.confirmation_code}</code></td>
              <td><span className={`hh-status hh-status-${b.status}`}>{b.status}</span></td>
              <td>
                {b.status === "confirmed" && (
                  <button
                    className="hh-btn-ghost hh-btn-danger"
                    onClick={() => updateStatus(b.id, "cancelled")}
                  >
                    Cancel
                  </button>
                )}
                {b.status === "cancelled" && (
                  <button
                    className="hh-btn-ghost"
                    onClick={() => updateStatus(b.id, "confirmed")}
                  >
                    Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Property Form ─── */
function PropertyForm({ initial, onSave, onCancel }) {
  const [form,   setForm]   = useState(
    initial || { id: "", name: "", location: "", price: "", beds: 1, baths: 1, guests: 2, tagline: "", blurb: "", hue: "#2A3B2D", accent: "#C4622D", active: true }
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price:  Number(form.price),
        beds:   Number(form.beds),
        baths:  Number(form.baths),
        guests: Number(form.guests),
      };
      const { error: err } = initial
        ? await supabase.from("properties").update(payload).eq("id", initial.id)
        : await supabase.from("properties").insert(payload);
      if (err) throw err;
      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="hh-prop-form">
      <div className="hh-prop-form-grid">
        {!initial && (
          <div className="hh-form-group">
            <label>ID (slug, e.g. "pine")</label>
            <input className="hh-form-input" value={form.id} onChange={(e) => set("id", e.target.value)} required />
          </div>
        )}
        <div className="hh-form-group">
          <label>Name</label>
          <input className="hh-form-input" value={form.name} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div className="hh-form-group">
          <label>Location</label>
          <input className="hh-form-input" value={form.location} onChange={(e) => set("location", e.target.value)} required />
        </div>
        <div className="hh-form-group">
          <label>Price / night ($)</label>
          <input type="number" className="hh-form-input" value={form.price} onChange={(e) => set("price", e.target.value)} required />
        </div>
        <div className="hh-form-group">
          <label>Beds</label>
          <input type="number" className="hh-form-input" value={form.beds} onChange={(e) => set("beds", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group">
          <label>Baths</label>
          <input type="number" className="hh-form-input" value={form.baths} onChange={(e) => set("baths", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group">
          <label>Max guests</label>
          <input type="number" className="hh-form-input" value={form.guests} onChange={(e) => set("guests", e.target.value)} min={1} />
        </div>
        <div className="hh-form-group hh-form-group-full">
          <label>Tagline</label>
          <input className="hh-form-input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </div>
        <div className="hh-form-group hh-form-group-full">
          <label>Description</label>
          <textarea className="hh-form-input hh-form-textarea" rows={3} value={form.blurb} onChange={(e) => set("blurb", e.target.value)} />
        </div>
        <div className="hh-form-group">
          <label>Theme color</label>
          <input type="color" className="hh-form-input hh-color-input" value={form.hue} onChange={(e) => set("hue", e.target.value)} />
        </div>
        <div className="hh-form-group">
          <label>Accent color</label>
          <input type="color" className="hh-form-input hh-color-input" value={form.accent} onChange={(e) => set("accent", e.target.value)} />
        </div>
      </div>
      {error && <p className="hh-pay-error">{error}</p>}
      <div className="hh-prop-form-actions">
        <button type="button" className="hh-btn hh-btn-outline" onClick={onCancel}>Cancel</button>
        <button type="submit" className="hh-btn hh-btn-solid" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add property"}
        </button>
      </div>
    </form>
  );
}

/* ─── Properties Manager ─── */
function PropertiesManager() {
  const [properties, setProperties] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [editing,    setEditing]    = useState(null);

  const fetchProperties = async () => {
    const { data } = await supabase.from("properties").select("*").order("created_at");
    setProperties(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const deleteProperty = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await supabase.from("properties").delete().eq("id", id);
    fetchProperties();
  };

  const toggleActive = async (id, active) => {
    await supabase.from("properties").update({ active: !active }).eq("id", id);
    fetchProperties();
  };

  if (loading) return <p className="hh-dash-empty">Loading…</p>;

  if (editing) {
    return (
      <div>
        <h3 className="hh-dash-section-title" style={{ marginBottom: "1.5rem" }}>
          {editing === "new" ? "Add property" : `Edit: ${editing.name}`}
        </h3>
        <PropertyForm
          initial={editing === "new" ? null : editing}
          onSave={() => { setEditing(null); fetchProperties(); }}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="hh-dash-section-header">
        <h3 className="hh-dash-section-title">{properties.length} Properties</h3>
        <button className="hh-btn hh-btn-solid" onClick={() => setEditing("new")}>+ Add property</button>
      </div>
      <div className="hh-dash-table-wrap">
        <table className="hh-dash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Price / night</th>
              <th>Beds · Baths · Guests</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className={!p.active ? "hh-row-cancelled" : ""}>
                <td>
                  <strong>{p.name}</strong>
                  <span className="hh-table-sub">{p.id}</span>
                </td>
                <td>{p.location}</td>
                <td>${p.price}</td>
                <td>{p.beds} · {p.baths} · {p.guests}</td>
                <td>
                  <button
                    className={`hh-status hh-status-${p.active ? "confirmed" : "cancelled"}`}
                    style={{ cursor: "pointer" }}
                    onClick={() => toggleActive(p.id, p.active)}
                  >
                    {p.active ? "Active" : "Hidden"}
                  </button>
                </td>
                <td className="hh-table-actions">
                  <button className="hh-btn-ghost" onClick={() => setEditing(p)}>Edit</button>
                  <button className="hh-btn-ghost hh-btn-danger" onClick={() => deleteProperty(p.id, p.name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Users ─── */
function UsersManager() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  const setRole = async (id, role) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role } : u)));
  };

  if (loading) return <p className="hh-dash-empty">Loading…</p>;
  if (!users.length) return <p className="hh-dash-empty">No users yet.</p>;

  return (
    <div className="hh-dash-table-wrap">
      <table className="hh-dash-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
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
              <td>
                <span className={`hh-status hh-status-${u.role === "admin" ? "confirmed" : "pending"}`}>
                  {u.role}
                </span>
              </td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                {u.role === "client" ? (
                  <button className="hh-btn-ghost" onClick={() => setRole(u.id, "admin")}>
                    Make admin
                  </button>
                ) : (
                  <button className="hh-btn-ghost hh-btn-danger" onClick={() => setRole(u.id, "client")}>
                    Revoke admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Main ─── */
export default function AdminDashboard({ onNavigate }) {
  const { user, profile, signOut } = useAuth();
  const [tab, setTab] = useState("bookings");

  const handleSignOut = async () => {
    await signOut();
    onNavigate("home");
  };

  return (
    <div className="hh-dash-page">
      <div className="hh-dash-header">
        <div>
          <p className="hh-kicker">Admin panel</p>
          <h1 className="hh-dash-title">Dashboard</h1>
        </div>
        <div className="hh-dash-header-actions">
          <button className="hh-btn hh-btn-outline" onClick={() => onNavigate("home")}>
            ← Back to site
          </button>
          <button className="hh-btn hh-btn-outline" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>

      <div className="hh-dash-tabs">
        <button className={tab === "bookings"   ? "active" : ""} onClick={() => setTab("bookings")}>
          All Bookings
        </button>
        <button className={tab === "properties" ? "active" : ""} onClick={() => setTab("properties")}>
          Properties
        </button>
        <button className={tab === "users"      ? "active" : ""} onClick={() => setTab("users")}>
          Users
        </button>
      </div>

      <div className="hh-dash-body">
        {tab === "bookings"   && <AllBookings />}
        {tab === "properties" && <PropertiesManager />}
        {tab === "users"      && <UsersManager />}
      </div>
    </div>
  );
}
