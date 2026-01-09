import { processStripeEvent } from "../services/stripe";
import Stripe from "stripe";

export async function handleStripeEvent(evt: Stripe.Event) {
  // simple wrapper that calls processing and returns result
  return await processStripeEvent(evt);
}
