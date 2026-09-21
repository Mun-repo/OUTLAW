import { createFileRoute } from "@tanstack/react-router";
import { fulfillBySessionId } from "@/lib/server/orders";
import { parseStripeWebhook } from "@/lib/server/stripe";

const PAID_EVENTS = new Set([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
]);

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const payload = await request.text();
        const signature = request.headers.get("stripe-signature");
        let event;
        try {
          event = parseStripeWebhook(payload, signature);
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Webhook invalide" },
            { status: 400 },
          );
        }
        if (!PAID_EVENTS.has(event.type)) {
          return Response.json({ received: true, ignored: event.type });
        }
        const sessionId = event.data.object.id;
        if (!sessionId) {
          return Response.json({ error: "Session introuvable" }, { status: 400 });
        }
        try {
          const order = await fulfillBySessionId(sessionId);
          return Response.json({
            received: true,
            orderNumber: order.orderNumber,
            status: order.status,
          });
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Commande impossible" },
            { status: 400 },
          );
        }
      },
    },
  },
});
