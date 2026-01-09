import express, { Router } from "express";
import Stripe from "stripe";
import { handleStripeEvent } from "./webhooks.handlers";

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET || "", { apiVersion: ("2024-11-14" as unknown as Stripe.LatestApiVersion) });

// Stripe requires the raw body for signature verification. The route attaches express.raw as route middleware.
router.post("/stripe", express.raw({ type: "application/json" }), async (req: express.Request, res: express.Response) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !webhookSecret) return res.status(400).send({ error: 'Missing signature or webhook secret' });
  try {
    // express.raw provides the raw Buffer body
    const rawBody = req.body as Buffer;
    const evt = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    // Use handler to process relevant events
    const result = await handleStripeEvent(evt);
    console.log("Stripe event processed:", evt.type);
    res.status(200).send({ received: true, result });
  } catch (err) {
    console.error("Webhook error", (err as Error).message || err);
    res.status(400).send(`Webhook error: ${(err as Error).message || err}`);
  }
});

export default router;
