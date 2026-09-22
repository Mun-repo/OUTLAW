import { createFileRoute } from "@tanstack/react-router";
import { requestOrigin } from "@/lib/env.server";
import { startCheckout } from "@/lib/server/orders";

export const Route = createFileRoute("/api/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: {
          firstName?: string;
          lastName?: string;
          email?: string;
          items?: { productId: number; quantity: number }[];
          promoCode?: string | null;
          origin?: string;
        };
        try {
          body = (await request.json()) as typeof body;
        } catch {
          return Response.json({ error: "Requête invalide" }, { status: 400 });
        }
        try {
          const result = await startCheckout({
            data: {
              firstName: body.firstName ?? "",
              lastName: body.lastName ?? "",
              email: body.email ?? "",
              items: body.items ?? [],
              promoCode: body.promoCode ?? null,
              origin:
                typeof body.origin === "string" && body.origin
                  ? body.origin
                  : requestOrigin(request),
            },
          });
          return Response.json(result, {
            headers: { "cache-control": "no-store" },
          });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Paiement impossible";
          const status = message.includes("STRIPE_SECRET_KEY") ? 503 : 400;
          return Response.json({ error: message }, { status });
        }
      },
    },
  },
});
