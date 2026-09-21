import { useState } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { ProductCard } from "@/components/shop/product-card";
import { ProductOverlay } from "@/components/shop/product-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/lib/shop";
import type { Product } from "@/lib/types";

export const Route = createFileRoute("/boutique")({
  component: BoutiquePage,
  head: () => ({
    meta: [{ title: "Boutique — Outlaw" }],
  }),
});

function BoutiquePage() {
  const [selected, setSelected] = useState<Product | null>(null);
  const { data, isLoading, isError } = useProducts();
  const products = data ?? [];

  if (!isLoading && !isError && products.length === 0) {
    return <Navigate to="/" />;
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-12">
        <p className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs">
          Catalogue
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-display md:text-6xl">
          Boutique
        </h1>
      </header>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="aspect-[4/5] w-full" />
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Impossible de charger le catalogue.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onOpen={setSelected} />
          ))}
        </div>
      )}

      <ProductOverlay product={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
