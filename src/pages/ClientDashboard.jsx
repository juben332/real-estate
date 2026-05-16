import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { prettyDate } from "../utils/dateHelpers";
import { requestCancellation } from "../utils/cancelBooking";

/* ─── Cancellation Request Modal ─── */
function CancelRequestModal({ booking, onClose, onSubmitted }) {
  const [reason,     setReason]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");

  const hoursUntilCheckIn = (new Date(booking.range_start) - new Date()) / 36e5;
  const withinWindow      = hoursUntilCheckIn <= 48;
  const refundAmt         = (Number(booking.total) * 0.80).toFixed(2);
  const feeAmt            = (Number(booking.total) * 0.20).toFixed(2);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    const result = await requestCancellation({
      bookingId:  booking.id,
      rangeStart: booking.range_start,
      reason,
    });
    setSubmitting(false);
    if (!result.success) {
      setError(result.error);
    } else {
      onSubmitted();
    }
  };

  return (
    <div className="hh-modal-overlay" onClick={onClose}>
      <div className="hh-modal" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="hh-modal-body">
          <h2 className="hh-modal-title">Request Cancellation</h2>

          <div className="cd-cancel-policy-box">
            <p className="cd-cancel-policy-title">Cancellation Policy</p>
            <div className="cd-cancel-policy-row">
              <span>You receive (80%)</span>
              <strong className="cd-policy-green">${Number(refundAmt).toLocaleString()}</strong>
            </div>
            <div className="cd-cancel-policy-row">
              <span>Cancellation fee (20%)</span>
              <strong className="cd-policy-red">${Number(feeAmt).toLocaleString()}</strong>
            </div>
            <div className="cd-cancel-policy-row cd-cancel-policy-total">
              <span>Booking total</span>
              <strong>${Number(booking.total).toLocaleString()}</strong>
            </div>
          </div>

          {withinWindow ? (
            <div className="cd-cancel-msg is-error" style={{ marginBottom: 0 }}>
              Cancellations are not allowed within 48 hours of check-in
              ({booking.range_start}). Please contact us directly.
            </div>
          ) : (
            <>
              <div className="hh-form-group" style={{ marginBottom: "1.25rem" }}>
                <label>Reason (optional)</label>
                <textarea
                  className="hh-form-input hh-form-textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Let us know why you're cancelling…"
                />
              </div>
              {error && <p className="hh-pay-error">{error}</p>}
              <p className="hh-pay-fineprint" style={{ marginBottom: "1rem" }}>
                Your request will be reviewed by our team. Once approved, ${Number(refundAmt).toLocaleString()} will
                be returned to your card within 5–10 business days.
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="hh-btn hh-btn-outline" style={{ flex: 1 }} onClick={onClose}>
                  Keep booking
                </button>
                <button
                  className="hh-btn hh-btn-solid"
                  style={{ flex: 1, background: "#b91c1c" }}
                  disabled={submitting}
                  onClick={submit}
                >
                  {submitting ? "Submitting…" : "Submit request"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Booking History ─── */
function BookingHistory({ userId }) {
  const [bookings,       setBookings]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [requestingFor,  setRequestingFor]  = useState(null);
  const [toast,          setToast]          = useState("");

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

  const onSubmitted = () => {
    setRequestingFor(null);
    setToast("Cancellation request submitted. We'll review it and get back to you.");
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

  const statusLabel = (b) => {
    if (b.status === "pending_cancellation") return "Pending review";
    return b.status;
  };
  const statusClass = (b) => {
    if (b.status === "pending_cancellation") return "hh-status hh-status-pending";
    return `hh-status hh-status-${b.status}`;
  };

  return (
    <div>
      {toast && (
        <div className="cd-cancel-msg is-success" style={{ marginBottom: "1rem" }}>
          {toast}
        </div>
      )}
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
                <td>
                  ${b.total?.toLocaleString()}
                  {b.refund_id && <span className="cd-refunded-badge">Refunded</span>}
                </td>
                <td><code style={{ fontSize: "0.8rem" }}>{b.confirmation_code}</code></td>
                <td><span className={statusClass(b)}>{statusLabel(b)}</span></td>
                <td>
                  {b.status === "confirmed" && (
                    <button
                      className="hh-btn-ghost hh-btn-danger"
                      onClick={() => setRequestingFor(b)}
                    >
                      Request cancel
                    </button>
                  )}
                  {b.status === "pending_cancellation" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }}>Awaiting review</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requestingFor && (
        <CancelRequestModal
          booking={requestingFor}
          onClose={() => setRequestingFor(null)}
          onSubmitted={onSubmitted}
        />
      )}
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
