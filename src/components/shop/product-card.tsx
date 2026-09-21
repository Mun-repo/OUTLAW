import { formatPrice } from "@/lib/format";
import { productImages, type Product } from "@/lib/types";

export function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen?: (product: Product) => void;
}) {
  const cover = productImages(product)[0];

  return (
    <article
      className="media-card group flex cursor-pointer flex-col overflow-hidden bg-card"
      onClick={() => onOpen?.(product)}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {cover ? (
          <img src={cover} alt={product.title} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="font-display text-5xl font-extrabold tracking-display text-muted-foreground/40">
              {product.title.slice(0, 1)}
            </span>
          </div>
        )}
        <div className="photo-grain" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-extrabold leading-snug tracking-display">
            {product.title}
          </h3>
          <p className="shrink-0 text-sm tabular-nums text-foreground">
            {formatPrice(product.price)}
          </p>
        </div>
        {product.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        ) : null}
        <p className="mt-auto text-2xs tracking-lux uppercase text-muted-foreground">
          Voir l'édition
        </p>
      </div>
    </article>
  );
}
