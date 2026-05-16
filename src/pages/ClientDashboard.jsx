import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { prettyDate } from "../utils/dateHelpers";

/* ─── Booking History ─── */
function BookingHistory({ userId }) {
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from("bookings")
      .select("*, properties(name, location)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [userId]);

  const cancel = async (id) => {
    if (!confirm("Cancel this booking? This cannot be undone.")) return;
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", id);
    fetchBookings();
  };

  if (loading) return <p className="hh-dash-empty">Loading bookings…</p>;
  if (!bookings.length) return (
    <div className="cd-empty-state">
      <span className="cd-empty-icon">🏡</span>
      <h3>No bookings yet</h3>
      <p>Explore our properties and book your first stay.</p>
    </div>
  );

  return (
    <div className="hh-dash-table-wrap">
      <table className="hh-dash-table">
        <thead>
          <tr>
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
              <td>
                <strong>{b.properties?.name ?? b.property_id}</strong>
                <span className="hh-table-sub">{b.properties?.location}</span>
              </td>
              <td>{prettyDate(b.range_start)} → {prettyDate(b.range_end)}</td>
              <td>{b.nights}</td>
              <td>${b.total?.toLocaleString()}</td>
              <td><code style={{ fontSize: "0.8rem" }}>{b.confirmation_code}</code></td>
              <td><span className={`hh-status hh-status-${b.status}`}>{b.status}</span></td>
              <td>
                {b.status === "confirmed" && (
                  <button className="hh-btn-ghost hh-btn-danger" onClick={() => cancel(b.id)}>
                    Cancel
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

/* ─── Profile Editor ─── */
function ProfileEditor() {
  const { user, profile, updateProfile } = useAuth();
  const [form,   setForm]   = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(""); // "" | "saved" | "error"
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    setForm({
      name:  profile?.name  || "",
      phone: profile?.phone || "",
    });
  }, [profile]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await updateProfile({ name: form.name.trim(), phone: form.phone.trim() });
      setStatus("saved");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      setErrMsg(err.message);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] || "?").toUpperCase();

  return (
    <div className="cd-profile-wrap">
      {/* Avatar */}
      <div className="cd-avatar-block">
        <div className="cd-avatar">{initials}</div>
        <div>
          <h3 className="cd-avatar-name">{form.name || "Your Name"}</h3>
          <p className="cd-avatar-email">{user?.email}</p>
          <span className="hh-status hh-status-pending cd-role-badge">
            {profile?.role || "client"}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={save} className="cd-profile-form">
        <div className="cd-form-section-title">Personal Information</div>

        <div className="cd-field-row">
          <div className="hh-form-group">
            <label>Full Name</label>
            <input
              className="hh-form-input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Juan dela Cruz"
            />
          </div>
          <div className="hh-form-group">
            <label>Contact Number</label>
            <input
              className="hh-form-input"
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="e.g. +63 912 345 6789"
            />
          </div>
        </div>

        <div className="cd-form-section-title" style={{ marginTop: "1.5rem" }}>Account</div>

        <div className="hh-form-group">
          <label>Email Address</label>
          <input
            className="hh-form-input"
            value={user?.email || ""}
            disabled
            style={{ background: "var(--bg-2)", color: "var(--ink-soft)", cursor: "not-allowed" }}
          />
          <span className="cd-field-note">Email cannot be changed.</span>
        </div>

        {status === "error" && <p className="hh-pay-error">{errMsg}</p>}

        <div className="cd-form-actions">
          {status === "saved" && <span className="cd-saved-msg">✓ Changes saved</span>}
          <button type="submit" className="hh-btn hh-btn-solid" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─── Main ─── */
export default function ClientDashboard({ onNavigate }) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState("bookings");

  useEffect(() => { refreshProfile(); }, []);

  const handleSignOut = async () => {
    await signOut();
    onNavigate("home");
  };

  const firstName = profile?.name?.split(" ")[0] || user?.email?.split("@")[0] || "there";

  return (
    <div className="hh-dash-page">
      <div className="hh-dash-header">
        <div>
          <p className="hh-kicker">My Account</p>
          <h1 className="hh-dash-title">Welcome back, {firstName}</h1>
        </div>
        <button className="hh-btn hh-btn-outline" onClick={handleSignOut}>Sign out</button>
      </div>

      <div className="hh-dash-tabs">
        <button className={tab === "bookings" ? "active" : ""} onClick={() => setTab("bookings")}>
          My Bookings
        </button>
        <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
          Profile
        </button>
      </div>

      <div className="hh-dash-body">
        {tab === "bookings" && <BookingHistory userId={user.id} />}
        {tab === "profile"  && <ProfileEditor />}
      </div>
    </div>
  );
}
