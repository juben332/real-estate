import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { prettyDate } from "../utils/dateHelpers";

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
  if (!bookings.length) return <p className="hh-dash-empty">No bookings yet — explore a property to get started.</p>;

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
              <td><code>{b.confirmation_code}</code></td>
              <td>
                <span className={`hh-status hh-status-${b.status}`}>{b.status}</span>
              </td>
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

function ProfileEditor() {
  const { user, profile, updateProfile } = useAuth();
  const [name,   setName]   = useState(profile?.name || "");
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="hh-profile-form">
      <div className="hh-form-group">
        <label>Full name</label>
        <input
          className="hh-form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="hh-form-group">
        <label>Email</label>
        <input className="hh-form-input" value={user?.email || ""} disabled />
      </div>
      <button type="submit" className="hh-btn hh-btn-solid" disabled={saving}>
        {saved ? "Saved!" : saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

export default function ClientDashboard({ onNavigate }) {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [tab, setTab] = useState("bookings");

  useEffect(() => { refreshProfile(); }, []);

  const handleSignOut = async () => {
    await signOut();
    onNavigate("home");
  };

  return (
    <div className="hh-dash-page">
      <div className="hh-dash-header">
        <div>
          <p className="hh-kicker">My account</p>
          <h1 className="hh-dash-title">Welcome, {profile?.name || user?.email}</h1>
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
