import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cartCount, useCart } from "@/lib/cart-store";
import { useShopOpen } from "@/lib/shop";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = useCart((s) => s.items);
  const count = cartCount(items);
  const { isOpen: shopOpen } = useShopOpen();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const [revealed, setRevealed] = useState(!isHome);

  const nav = [
    { to: "/evenements" as const, label: "Événements" },
    ...(shopOpen ? [{ to: "/boutique" as const, label: "Boutique" }] : []),
  ];

  useEffect(() => {
    if (isAdmin) return;
    if (!isHome) {
      setRevealed(true);
      setOpen(false);
      return;
    }
    const update = () => setRevealed(window.scrollY > 72);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [isHome, isAdmin, pathname]);

  if (isAdmin) return null;

  return (
    <>
      <header
        aria-hidden={!revealed}
        {...(!revealed ? { inert: true } : {})}
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b border-border",
          "bg-background/70 backdrop-blur-md",
          "transition-[opacity,translate] duration-700 ease-outlaw",
          revealed
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-full opacity-0",
        )}
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {nav.map((item) => {
              const active =
                pathname === item.to || pathname.startsWith(`${item.to}/`);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "nav-link text-xs font-medium tracking-lux uppercase text-muted-foreground",
                    active && "is-active text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="/#a-propos"
              className="nav-link text-xs font-medium tracking-lux uppercase text-muted-foreground"
            >
              À propos
            </a>
          </nav>

          <div className="flex items-center gap-1">
            {shopOpen ? (
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link to="/panier" aria-label="Panier">
                  <ShoppingBag className="size-5" />
                  {count > 0 ? (
                    <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs font-medium leading-none tabular-nums text-primary-foreground">
                      {count}
                    </span>
                  ) : null}
                </Link>
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>

        {open && revealed ? (
          <div className="border-t border-border px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="px-3 py-3 text-xs tracking-lux uppercase text-foreground hover:bg-secondary"
                >
                  {item.label}
                </Link>
              ))}
              <a
                href="/#a-propos"
                onClick={() => setOpen(false)}
                className="px-3 py-3 text-xs tracking-lux uppercase text-foreground hover:bg-secondary"
              >
                À propos
              </a>
            </nav>
          </div>
        ) : null}
      </header>
      {!isHome ? <div className="h-16" aria-hidden="true" /> : null}
    </>
  );
}
