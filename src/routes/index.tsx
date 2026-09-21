import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/events/event-card";
import { EventOverlay } from "@/components/events/event-overlay";
import { About } from "@/components/layout/about";
import { Hero } from "@/components/layout/hero";
import { ProductCard } from "@/components/shop/product-card";
import { ProductOverlay } from "@/components/shop/product-overlay";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/lib/server/catalog";
import { HERO_PUBLIC } from "@/lib/stock";
import { useProducts } from "@/lib/shop";
import type { EventItem, Product } from "@/lib/types";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: "Outlaw" }],
    links: [{ rel: "preload", as: "image", href: HERO_PUBLIC }],
  }),
});

function Home() {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const productsQuery = useProducts();
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => listEvents(),
  });

  const catalog = productsQuery.data ?? [];
  const products = catalog.slice(0, 4);
  const shopOpen = catalog.length > 0;
  const feed = eventsQuery.data ?? [];
  const featured = feed[0];
  const rest = feed.slice(1, 4);

  return (
    <main>
      <Hero />
      <About />

      <section
        id="evenements"
        className="border-y border-border bg-card/40"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-12 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs">
                Fil d'actualité
              </p>
              <h2 className="mt-3 font-display text-5xl font-extrabold leading-[0.9] tracking-display md:text-7xl lg:text-8xl">
                Événements
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                {shopOpen
                  ? "Nuits, sessions et plateaux du collectif — à découvrir et à rejoindre avant la boutique."
                  : "Nuits, sessions et plateaux du collectif — à découvrir et à rejoindre."}
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link to="/evenements">Tout voir</Link>
            </Button>
          </div>

          {eventsQuery.isLoading ? (
            <div className="flex flex-col gap-6">
              <Skeleton className="h-[28rem] w-full" />
              <div className="grid gap-6 md:grid-cols-2">
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-72 w-full" />
              </div>
            </div>
          ) : featured ? (
            <div className="flex flex-col gap-6">
              <EventCard
                event={featured}
                featured
                index={0}
                onOpen={setSelectedEvent}
              />
              {rest.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {rest.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i + 1}
                      onOpen={setSelectedEvent}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="border border-dashed border-border px-6 py-16 text-center">
              <p className="font-display text-2xl font-extrabold tracking-display">
                Aucun événement annoncé pour le moment
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Les prochaines dates du collectif apparaîtront ici.
              </p>
            </div>
          )}
        </div>
      </section>

      {shopOpen ? (
        <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
          <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs">
                Éditions
              </p>
              <h2 className="mt-2 font-display text-4xl font-extrabold tracking-display md:text-5xl">
                Boutique
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/boutique">Tout voir</Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpen={setSelectedProduct}
              />
            ))}
          </div>
        </section>
      ) : null}

      <EventOverlay event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      <ProductOverlay
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </main>
  );
}
