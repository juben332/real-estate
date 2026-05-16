import { useState } from "react";
import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";
import BookingCalendar from "../booking/BookingCalendar";
import PaymentModal from "../payment/PaymentModal";
import { CHANNELS } from "../../data/properties"; // channel colour legend only
import { nightsBetween } from "../../utils/dateHelpers";

export default function PropertyDetail({ property, propertyBookings, onAddBooking, onBack }) {
  const p = property;
  const [range, setRange]     = useState({ start: null, end: null });
  const [showPay, setShowPay] = useState(false);

  const nights = range.start && range.end ? nightsBetween(range.start, range.end) : 0;
  const total  = nights * p.price;
  const ready  = nights > 0;

  const handleClose = (completed) => {
    setShowPay(false);
    if (completed) {
      setRange({ start: null, end: null });
      onAddBooking(); // re-fetch availability from Supabase
    }
  };

  return (
    <section className="hh-detail" style={{ "--c": p.hue, "--a": p.accent }}>
      <button className="hh-back" onClick={onBack}>
        <Icon d={icons.back} size={16} /> All properties
      </button>

      <div className="hh-detail-hero">
        <div className="hh-detail-photo hh-detail-photo-lg"><PhotoMark label={p.name} /></div>
        <div className="hh-detail-photo"><PhotoMark label="The view" alt /></div>
        <div className="hh-detail-photo"><PhotoMark label="Inside"   alt /></div>
      </div>

      <div className="hh-detail-grid">
        {/* Left: info */}
        <div>
          <div className="hh-card-loc">
            <Icon d={icons.pin} size={14} /> {p.location}
          </div>
          <h1 className="hh-detail-name">{p.name}</h1>
          <p className="hh-detail-tagline">{p.tagline}</p>
          <p className="hh-detail-blurb">{p.blurb}</p>

          <div className="hh-detail-specs">
            <div><strong>{p.guests}</strong><span>guests</span></div>
            <div><strong>{p.beds}</strong><span>bedrooms</span></div>
            <div><strong>{p.baths}</strong><span>bath</span></div>
            <div><strong>4.9★</strong><span>rated</span></div>
          </div>

          <h3 className="hh-h3">What's inside</h3>
          <ul className="hh-amenities">
            {p.amenities.map((a) => (
              <li key={a}><span className="hh-dot" /> {a}</li>
            ))}
          </ul>
        </div>

        {/* Right: booking panel */}
        <aside className="hh-booking">
          <div className="hh-booking-head">
            <div className="hh-booking-price">
              <strong>${p.price}</strong> <span>/ night · all-in</span>
            </div>
            <span className="hh-instant">
              <Icon d={icons.bolt} size={13} /> Instant booking
            </span>
          </div>

          <BookingCalendar
            propertyBookings={propertyBookings}
            value={range}
            onChange={setRange}
          />

          <div className="hh-cal-summary">
            {ready ? (
              <>
                <div className="hh-sum-row">
                  <span>${p.price} × {nights} night{nights > 1 ? "s" : ""}</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="hh-sum-row hh-sum-total">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <p className="hh-sum-hint">Pick your check-in and check-out dates above.</p>
            )}
            <button
              className="hh-btn hh-btn-solid hh-btn-full"
              disabled={!ready}
              onClick={() => setShowPay(true)}
            >
              {ready ? `Reserve · $${total.toLocaleString()}` : "Select dates"}{" "}
              <Icon d={icons.arrow} />
            </button>
            <p className="hh-booking-note">
              You're booking directly with the host — the full payment goes to us, not a platform.
            </p>
          </div>

          {/* Channel management sync strip */}
          <div className="hh-sync-strip">
            <div className="hh-sync-strip-top">
              <span className="hh-sync-pulse" /> Calendar synced
            </div>
            <div className="hh-chan-legend">
              {Object.values(CHANNELS).map((c) => (
                <span key={c.label} className="hh-chan-item">
                  <i style={{ background: c.color }} /> {c.label}
                </span>
              ))}
            </div>
            <p>
              Availability updates live across every platform — book here and these nights block
              on Airbnb, Vrbo &amp; Booking.com instantly.
            </p>
          </div>
        </aside>
      </div>

      {showPay && (
        <PaymentModal
          property={p}
          range={range}
          nights={nights}
          total={total}
          onConfirm={() => {}}
          onClose={handleClose}
        />
      )}
    </section>
  );
}
