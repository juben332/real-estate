import { supabase } from "../lib/supabase";

/**
 * Cancels a booking and issues a Stripe refund if a payment was captured.
 * Returns { success, refunded, amount, error }.
 */
export async function cancelBooking({ bookingId, paymentIntentId }) {
  // 1. Call serverless function to issue Stripe refund
  let refundId   = null;
  let refundedAt = null;
  let amount     = 0;

  if (paymentIntentId) {
    const res  = await fetch("/api/refund", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ paymentIntentId }),
    });
    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.error || "Refund failed" };
    }

    refundId   = data.refundId;
    amount     = data.amount || 0;
    refundedAt = refundId ? new Date().toISOString() : null;
  }

  // 2. Update booking in Supabase
  const { error: dbError } = await supabase
    .from("bookings")
    .update({
      status:      "cancelled",
      refund_id:   refundId,
      refunded_at: refundedAt,
    })
    .eq("id", bookingId);

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  return { success: true, refunded: !!refundId, amount };
}
