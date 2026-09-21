import { createFileRoute } from "@tanstack/react-router";
import { requestOrigin } from "@/lib/env.server";
import { fulfillByOrderNumber, fulfillBySessionId } from "@/lib/server/orders";

export const Route = createFileRoute("/api/checkout/success")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id")?.trim() || "";
        const orderNumber = url.searchParams.get("order")?.trim() || "";
        const origin = requestOrigin(request);
        try {
          const order = sessionId
            ? await fulfillBySessionId(sessionId)
            : orderNumber
              ? await fulfillByOrderNumber(orderNumber)
              : null;
          if (!order) {
            return Response.redirect(`${origin}/panier`, 303);
          }
          return Response.redirect(
            `${origin}/shop/success?order=${encodeURIComponent(order.orderNumber)}`,
            303,
          );
        } catch {
          return Response.redirect(`${origin}/panier`, 303);
        }
      },
    },
  },
});
