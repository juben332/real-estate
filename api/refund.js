import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { paymentIntentId, amountDollars } = req.body;

  if (!paymentIntentId) {
    return res.status(200).json({ refundId: null, message: "No payment to refund" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ error: `Payment not refundable (status: ${paymentIntent.status})` });
    }

    const refundParams = {
      payment_intent: paymentIntentId,
      reason: "requested_by_customer",
    };

    // Partial refund: pass amount in cents
    if (amountDollars != null) {
      refundParams.amount = Math.round(amountDollars * 100);
    }

    const refund = await stripe.refunds.create(refundParams);

    return res.status(200).json({
      refundId: refund.id,
      amount:   refund.amount / 100,
      status:   refund.status,
    });
  } catch (err) {
    if (err.code === "charge_already_refunded") {
      return res.status(400).json({ error: "This booking has already been refunded." });
    }
    return res.status(500).json({ error: err.message });
  }
}
