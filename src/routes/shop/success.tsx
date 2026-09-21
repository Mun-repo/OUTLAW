import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatOrderNumber, formatPrice } from "@/lib/format";
import { loadCheckoutSuccess } from "@/lib/server/orders";
import type { ShopOrder } from "@/lib/types";

type SuccessSearch = {
  session_id?: string;
  order?: string;
};

export const Route = createFileRoute("/shop/success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch => ({
    session_id:
      typeof search.session_id === "string" ? search.session_id : undefined,
    order: typeof search.order === "string" ? search.order : undefined,
  }),
  loaderDeps: ({ search }) => ({
    sessionId: search.session_id,
    orderNumber: search.order,
  }),
  loader: async ({
    deps,
  }): Promise<{ order: ShopOrder | null; error: string | null }> => {
    if (!deps.sessionId && !deps.orderNumber) {
      return { order: null, error: "Commande introuvable" };
    }
    try {
      const order = await loadCheckoutSuccess({
        data: {
          sessionId: deps.sessionId,
          orderNumber: deps.orderNumber,
        },
      });
      return { order, error: null };
    } catch (err) {
      return {
        order: null,
        error: err instanceof Error ? err.message : "Commande introuvable",
      };
    }
  },
  component: SuccessPage,
  head: () => ({
    meta: [{ title: "Commande confirmée — Outlaw" }],
  }),
});

function SuccessPage() {
  const { order, error } = Route.useLoaderData();
  const clear = useCart((s) => s.clear);

  useEffect(() => {
    if (!order) return;
    const wipe = () => clear();
    wipe();
    const persist = useCart.persist;
    if (persist.hasHydrated()) wipe();
    const unsub = persist.onFinishHydration(wipe);
    return () => {
      unsub();
    };
  }, [order, clear]);

  if (!order) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-24 text-center md:px-6">
        <p className="text-xs tracking-lux uppercase text-muted-foreground">
          Boutique
        </p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-display">
          Commande introuvable
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          {error || "Le paiement n'a pas pu être confirmé."}
        </p>
        <Button asChild className="mt-8">
          <Link to="/panier">Retour au panier</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col px-4 py-16 md:px-6 md:py-24">
      <p className="text-xs tracking-lux uppercase text-muted-foreground">
        Paiement reçu
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-display md:text-5xl">
        Merci {order.firstName}.
      </h1>
      <p className="mt-8 text-xs tracking-lux uppercase text-muted-foreground">
        Ton numéro de commande
      </p>
      <p className="mt-3 font-display text-5xl font-extrabold tracking-display md:text-7xl">
        {formatOrderNumber(order.orderNumber)}
      </p>
      <ul className="mt-10 flex flex-col gap-3 border-t border-border pt-6">
        {order.items.map((item) => (
          <li
            key={`${item.productId}-${item.title}`}
            className="flex items-baseline justify-between gap-4 text-sm"
          >
            <span>
              {item.title} × {item.quantity}
            </span>
            <span className="tabular-nums text-muted-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 flex items-baseline justify-between border-t border-border pt-4 text-sm">
        <span className="tracking-lux uppercase text-muted-foreground">
          Total payé
        </span>
        <span className="text-lg font-medium tabular-nums">
          {formatPrice(order.total)}
        </span>
      </p>
      <p className="mt-10 text-base leading-relaxed text-foreground">
        Remise en main propre à l'université. Présente ce numéro de commande
        ou l'e-mail de confirmation pour récupérer tes articles.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link to="/boutique">Retour à la boutique</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/">Accueil</Link>
        </Button>
      </div>
    </main>
  );
}
