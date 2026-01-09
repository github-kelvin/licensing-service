import prisma from "../prisma";
import Stripe from "stripe";

type StripeObj = {
  id?: string;
  amount_total?: number;
  amount?: number;
  currency?: string;
  metadata?: Record<string, string> | undefined;
  payment_intent?: string;
  subscription?: string;
};

export async function processStripeEvent(evt: Stripe.Event) {
  const type = evt.type;
  const data = (evt.data?.object || {}) as StripeObj;

  if (type === "checkout.session.completed" || type === "invoice.paid" || type === "payment_intent.succeeded") {
    const providerId = data.id || data.payment_intent || data.subscription || "";
    const amount = (data.amount_total || data.amount) ?? 0;
    const currency = (data.currency || "usd").toLowerCase();
    const status = "paid";
    // Try to determine orgId from metadata
    const orgId = data.metadata?.orgId || undefined;

    const payment = await prisma.payment.create({ data: { provider: 'stripe', providerId, amount: Math.floor(amount), currency, status, orgId } });
    return payment;
  }

  // Unhandled events: return null
  return null;
}
