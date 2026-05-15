import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";
import ChannelSync from "../booking/ChannelSync";
import { prettyDate } from "../../utils/dateHelpers";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ property, range, nights, total, onConfirm, onClose }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [step, setStep]     = useState("details");
  const [errMsg, setErrMsg] = useState("");
  const [ready, setReady]   = useState(false);
  const [code] = useState(() => "HH-" + Math.random().toString(36).slice(2, 7).toUpperCase());

  const fee = +(total * 0.029 + 0.3).toFixed(2);

  const pay = async () => {
    if (!stripe || !elements) return;
    // Don't unmount the PaymentElement before confirmPayment runs —
    // show processing overlay instead, keeping the element in the DOM
    setStep("processing");
    setErrMsg("");
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: "if_required",
      });
      if (error) {
        setErrMsg(error.message);
        setStep("details");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onConfirm();
        setStep("done");
      }
    } catch (err) {
      setErrMsg(err.message);
      setStep("details");
    }
  };

  return (
    <>
      {/* Close button — hidden while processing */}
      {step !== "processing" && (
        <button className="hh-modal-x" onClick={() => onClose(step === "done")} aria-label="Close">
          <Icon d={icons.close} size={18} />
        </button>
      )}

      {/* ── Details — always stays in the DOM so PaymentElement never unmounts ── */}
      <div style={{ display: step === "details" ? "block" : "none" }}>
        <div className="hh-modal-body">
          <p className="hh-kicker">Secure payment via Stripe</p>
          <h2 className="hh-modal-title">Confirm &amp; pay</h2>

          <div className="hh-pay-summary">
            <div className="hh-pay-sum-photo"><PhotoMark label={property.name} /></div>
            <div>
              <h3>{property.name}</h3>
              <p>{property.location}</p>
              <p className="hh-pay-sum-dates">
                {prettyDate(range.start)} → {prettyDate(range.end)} · {nights} night{nights > 1 ? "s" : ""}
              </p>
            </div>
            <div className="hh-pay-sum-total">
              <strong>${total.toLocaleString()}</strong>
              <span>total</span>
            </div>
          </div>

          <div className="hh-stripe-element">
            <PaymentElement onReady={() => setReady(true)} />
          </div>

          {errMsg && <p className="hh-pay-error">{errMsg}</p>}

          <button
            className="hh-btn hh-btn-solid hh-btn-full"
            disabled={!stripe || !ready}
            onClick={pay}
          >
            <Icon d={icons.lock} size={15} /> Pay ${total.toLocaleString()}
          </button>
          <p className="hh-pay-fineprint">
            Processed securely by Stripe. Card fee ~${fee.toLocaleString()} (~2.9% + $0.30) —
            no platform commission, unlike the ~14% a booking site would add.
          </p>
        </div>
      </div>

      {/* ── Processing overlay ── */}
      {step === "processing" && (
        <div className="hh-modal-body hh-processing">
          <span className="hh-spinner" />
          <h2 className="hh-modal-title">Charging your card…</h2>
          <p>Securely processing your payment. One moment.</p>
        </div>
      )}

      {/* ── Confirmed ── */}
      {step === "done" && (
        <div className="hh-modal-body hh-confirmed">
          <span className="hh-confirmed-mark"><Icon d={icons.check} size={30} /></span>
          <h2 className="hh-modal-title">Booking confirmed</h2>
          <p className="hh-confirmed-sub">You're all set! A receipt and check-in details are on their way.</p>
          <div className="hh-confirmed-card">
            <div className="hh-confirmed-row"><span>Property</span><strong>{property.name}</strong></div>
            <div className="hh-confirmed-row">
              <span>Dates</span>
              <strong>{prettyDate(range.start)} → {prettyDate(range.end)}</strong>
            </div>
            <div className="hh-confirmed-row"><span>Nights</span><strong>{nights}</strong></div>
            <div className="hh-confirmed-row"><span>Paid</span><strong>${total.toLocaleString()}</strong></div>
            <div className="hh-confirmed-row"><span>Confirmation</span><strong>{code}</strong></div>
          </div>
          <ChannelSync />
          <button className="hh-btn hh-btn-solid hh-btn-full" onClick={() => onClose(true)}>Done</button>
        </div>
      )}
    </>
  );
}

export default function PaymentModal({ property, range, nights, total, onConfirm, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [fetchError,   setFetchError]   = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: total }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) throw new Error(data.error);
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err.message);
      });
    return () => { cancelled = true; };
  }, [total]);

  return (
    <div className="hh-modal-overlay" onClick={() => onClose(false)}>
      <div
        className="hh-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ "--c": property.hue, "--a": property.accent }}
      >
        {fetchError ? (
          <div className="hh-modal-body">
            <button className="hh-modal-x" onClick={() => onClose(false)} aria-label="Close">
              <Icon d={icons.close} size={18} />
            </button>
            <p className="hh-pay-error">Could not initialise payment: {fetchError}</p>
          </div>
        ) : !clientSecret ? (
          <div className="hh-modal-body hh-processing">
            <span className="hh-spinner" />
            <p>Preparing secure checkout…</p>
          </div>
        ) : (
          <Elements
            key={clientSecret}
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <CheckoutForm
              property={property}
              range={range}
              nights={nights}
              total={total}
              onConfirm={onConfirm}
              onClose={onClose}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
