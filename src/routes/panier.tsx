import { FormEvent, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  applyPromo,
  cartCount,
  cartSubtotal,
  useCart,
} from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { startCheckout } from "@/lib/server/orders";
import { redeemPromoCode } from "@/lib/server/promos";

export const Route = createFileRoute("/panier")({
  component: CartPage,
  head: () => ({
    meta: [{ title: "Panier — Outlaw" }],
  }),
});

function CartPage() {
  const items = useCart((s) => s.items);
  const promo = useCart((s) => s.promo);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const setPromo = useCart((s) => s.setPromo);
  const count = cartCount(items);
  const subtotal = cartSubtotal(items);
  const priced = applyPromo(subtotal, promo);
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [buyer, setBuyer] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  async function applyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const redeemed = await redeemPromoCode({ data: { code } });
      setPromo(redeemed);
      toast.success(
        redeemed.kind === "access"
          ? "Accès privilégié activé"
          : "Code promo appliqué",
      );
      setCode("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Code invalide");
    } finally {
      setPending(false);
    }
  }

  async function checkout(event: FormEvent) {
    event.preventDefault();
    setPaying(true);
    try {
      const result = await startCheckout({
        data: {
          firstName: buyer.firstName,
          lastName: buyer.lastName,
          email: buyer.email,
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          promoCode: promo?.code ?? null,
          origin: window.location.origin,
        },
      });
      window.location.assign(result.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Paiement impossible");
      setPaying(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-10">
        <p className="text-xs tracking-lux uppercase text-muted-foreground">
          Commande
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-display md:text-5xl">
          Panier
        </h1>
      </header>

      {items.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="font-display text-2xl font-extrabold tracking-display">
            Votre panier est vide
          </p>
          <Button asChild className="mt-6">
            <Link to="/boutique">Retour à la boutique</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <ul className="flex flex-col gap-4">
            {items.map((item) => (
              <li
                key={item.productId}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="size-20 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                    {formatPrice(item.price)}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Diminuer"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity - 1)
                      }
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="min-w-6 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label="Augmenter"
                      onClick={() =>
                        setQuantity(item.productId, item.quantity + 1)
                      }
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Retirer"
                  onClick={() => remove(item.productId)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>

          <form onSubmit={applyCode} className="flex gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Code promo"
              aria-label="Code promo"
            />
            <Button type="submit" variant="outline" disabled={pending || !code}>
              Appliquer
            </Button>
          </form>
          {promo ? (
            <p className="text-sm text-muted-foreground">
              Code {promo.code}
              {promo.kind === "access"
                ? " — accès privilégié"
                : ` — ${formatPrice(priced.discount)} de réduction`}
              {" · "}
              <button
                type="button"
                className="underline-offset-4 hover:underline"
                onClick={() => setPromo(null)}
              >
                Retirer
              </button>
            </p>
          ) : null}

          <div className="flex items-center justify-between border-t border-border pt-4">
            <p className="text-sm text-muted-foreground">
              {count} article{count > 1 ? "s" : ""}
            </p>
            <p className="text-lg font-medium tabular-nums">
              {formatPrice(priced.total)}
            </p>
          </div>

          <form
            onSubmit={checkout}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div>
              <p className="text-xs tracking-lux uppercase text-muted-foreground">
                Remise en main propre
              </p>
              <h2 className="mt-1 font-display text-xl font-medium">
                Tes coordonnées
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-last">Nom</Label>
                <Input
                  id="checkout-last"
                  name="lastName"
                  autoComplete="family-name"
                  value={buyer.lastName}
                  onChange={(e) =>
                    setBuyer((current) => ({
                      ...current,
                      lastName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="checkout-first">Prénom</Label>
                <Input
                  id="checkout-first"
                  name="firstName"
                  autoComplete="given-name"
                  value={buyer.firstName}
                  onChange={(e) =>
                    setBuyer((current) => ({
                      ...current,
                      firstName: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="checkout-email">E-mail</Label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                value={buyer.email}
                onChange={(e) =>
                  setBuyer((current) => ({ ...current, email: e.target.value }))
                }
                required
              />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Remise en main propre à l'université. Aucune livraison. Un e-mail
              de confirmation avec ton numéro de commande te sera envoyé.
            </p>
            <Button type="submit" size="lg" className="w-full" disabled={paying}>
              {paying ? "Redirection…" : "Payer"}
            </Button>
          </form>
        </div>
      )}
    </main>
  );
}
