import Stripe from "stripe";
import { env, isWorkspacePreview } from "@/lib/env.server";

export function getStripe() {
  const key = env("STRIPE_SECRET_KEY");
  if (!key) return null;
  if (key.startsWith("rk_")) {
    console.error(
      "[stripe] STRIPE_SECRET_KEY is a restricted key (rk_). Checkout needs sk_test_ or sk_live_.",
    );
    return null;
  }
  return new Stripe(key);
}

export function stripeConfigured() {
  return Boolean(env("STRIPE_SECRET_KEY"));
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