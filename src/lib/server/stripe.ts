import Stripe from "stripe";
import { env, isWorkspacePreview } from "@/lib/env.server";

let client: Stripe | null | undefined;

export function getStripe() {
  if (client !== undefined) return client;
  const key = env("STRIPE_SECRET_KEY");
  if (!key) {
    client = null;
    return null;
  }
  client = new Stripe(key);
  return client;
}

export function stripeConfigured() {
  return getStripe() !== null;
}

export type StripeWebhookEvent = {
  type: string;
  data: { object: { id?: string } };
};

export function parseStripeWebhook(
  payload: string,
  signature: string | null,
): StripeWebhookEvent {
  const secret = env("STRIPE_WEBHOOK_SECRET");
  const stripe = getStripe();
  if (stripe && secret && signature) {
    const event = stripe.webhooks.constructEvent(payload, signature, secret);
    const object = event.data.object as { id?: string };
    return { type: event.type, data: { object: { id: object.id } } };
  }
  if (!secret && isWorkspacePreview()) {
    return JSON.parse(payload) as StripeWebhookEvent;
  }
  throw new Error("Signature Stripe manquante");
}
