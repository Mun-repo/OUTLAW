import { useEffect, useState } from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Send,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { productImages, type Product } from "@/lib/types";

export function ProductOverlay({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  const add = useCart((s) => s.add);
  const [index, setIndex] = useState(0);
  const images = product ? productImages(product) : [];

  useEffect(() => {
    setIndex(0);
  }, [product?.id]);

  function handleOpen(open: boolean) {
    if (!open) onClose();
  }

  function prev() {
    setIndex((i) => (i - 1 + images.length) % images.length);
  }

  function next() {
    setIndex((i) => (i + 1) % images.length);
  }

  const current = images[index];

  return (
    <Dialog open={!!product} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-ig overflow-hidden p-0 sm:max-w-ig">
        {product ? (
          <article className="flex max-h-[92vh] flex-col overflow-y-auto bg-card">
            <header className="flex items-center gap-3 border-b border-border px-4 py-3 pr-14">
              <img src="/logo-outlaw.png" alt="" className="h-7 w-auto" />
              <div>
                <p className="text-xs font-medium tracking-lux uppercase">Outlaw</p>
                <p className="text-2xs text-muted-foreground">Collectif</p>
              </div>
            </header>

            <DialogTitle className="sr-only">{product.title}</DialogTitle>
            <DialogDescription className="sr-only">
              {product.description || "Détail de l'article"}
            </DialogDescription>

            <div className="relative isolate aspect-square overflow-hidden bg-secondary">
              {current ? (
                <img
                  src={current}
                  alt={product.title}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <span className="font-display text-6xl font-extrabold tracking-display text-muted-foreground/40">
                    {product.title.slice(0, 1)}
                  </span>
                </div>
              )}
              <div className="photo-grain" />
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    aria-label="Image précédente"
                    className="absolute top-1/2 left-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center border border-pure/30 bg-ink/55 text-pure backdrop-blur-sm"
                    onClick={prev}
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Image suivante"
                    className="absolute top-1/2 right-2 z-10 flex size-9 -translate-y-1/2 items-center justify-center border border-pure/30 bg-ink/55 text-pure backdrop-blur-sm"
                    onClick={next}
                  >
                    <ChevronRight className="size-5" />
                  </button>
                  <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
                    {images.map((_, i) => (
                      <span
                        key={i}
                        className={
                          i === index
                            ? "size-1.5 bg-pure"
                            : "size-1.5 bg-pure/35"
                        }
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>

            <div
              className="flex items-center justify-between px-4 py-3"
              aria-hidden="true"
            >
              <div className="flex items-center gap-4 pointer-events-none text-foreground">
                <Heart className="size-6" strokeWidth={1.75} />
                <MessageCircle className="size-6" strokeWidth={1.75} />
                <Send className="size-6" strokeWidth={1.75} />
              </div>
              <Bookmark className="size-6 pointer-events-none" strokeWidth={1.75} />
            </div>

            <div className="flex flex-col gap-3 px-4 pb-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl font-extrabold leading-tight tracking-display">
                  {product.title}
                </h3>
                <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.price)}</p>
              </div>
              {product.description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              ) : null}
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  add(product);
                  toast.success("Ajouté au panier");
                }}
              >
                <ShoppingBag className="size-4" />
                Ajouter au panier
              </Button>
            </div>
          </article>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
