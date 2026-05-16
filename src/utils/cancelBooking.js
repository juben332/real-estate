import { supabase } from "../lib/supabase";

const REFUND_RATE = 0.80; // 80% refunded, 20% kept as cancellation fee

/**
 * Approves a cancellation request: issues 80% Stripe refund and marks cancelled.
 * Called by admin only.
 */
export async function approveCancellation({ bookingId, paymentIntentId, total }) {
  let refundId   = null;
  let refundedAt = null;
  let refundAmt  = 0;

  if (paymentIntentId) {
    const amountDollars = +(Number(total) * REFUND_RATE).toFixed(2);

    const res  = await fetch("/api/refund", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ paymentIntentId, amountDollars }),
    });
    const data = await res.json();

    if (!res.ok) return { success: false, error: data.error || "Refund failed" };

    refundId   = data.refundId;
    refundAmt  = data.amount || 0;
    refundedAt = refundId ? new Date().toISOString() : null;
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status:                    "cancelled",
      refund_id:                 refundId,
      refunded_at:               refundedAt,
      cancellation_reviewed_at:  new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return { success: false, error: error.message };

  return { success: true, refunded: !!refundId, amount: refundAmt, kept: Number(total) - refundAmt };
}

/**
 * Admin cancels without any refund.
 */
export async function cancelNoRefund({ bookingId }) {
  const { error } = await supabase
    .from("bookings")
    .update({
      status:                   "cancelled",
      cancellation_reviewed_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (error) return { success: false, error: error.message };
  return { success: true, refunded: false };
}

/**
 * Client submits a cancellation request (does NOT cancel immediately).
 * Blocked if check-in is within 48 hours.
 */
export async function requestCancellation({ bookingId, rangeStart, reason }) {
  // 48-hour guard
  const checkIn    = new Date(rangeStart);
  const now        = new Date();
  const diffHours  = (checkIn - now) / 36e5;

  if (diffHours <= 48) {
    return {
      success: false,
      blocked: true,
      error: "Cancellations are not allowed within 48 hours of check-in.",
    };
  }

  const { error } = await supabase
    .from("bookings")
    .update({
      status:                       "pending_cancellation",
      cancellation_requested_at:    new Date().toISOString(),
      cancellation_reason:          reason || null,
    })
    .eq("id", bookingId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
