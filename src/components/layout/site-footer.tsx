import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LegalModal } from "@/components/layout/legal-modal";
import { Logo } from "@/components/logo";
import { useShopOpen } from "@/lib/shop";

export function SiteFooter() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [legalOpen, setLegalOpen] = useState(false);
  const { isOpen: shopOpen } = useShopOpen();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:items-end md:justify-between md:px-6">
        <div className="flex flex-col gap-4">
          <Logo imgClassName="h-7 md:h-8 opacity-90" />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            Collectif culturel indépendant. Plateforme d'événements
            immersifs et d'expression underground.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-xs tracking-lux uppercase text-muted-foreground">
          <a href="/#a-propos" className="hover:text-foreground">
            À propos
          </a>
          <Link to="/evenements" className="hover:text-foreground">
            Événements
          </Link>
          {shopOpen ? (
            <>
              <Link to="/boutique" className="hover:text-foreground">
                Boutique
              </Link>
              <Link to="/panier" className="hover:text-foreground">
                Panier
              </Link>
            </>
          ) : null}
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <p className="text-2xs tracking-lux uppercase text-muted-foreground/70">
            Association Outlaw · Loi 1901
          </p>
          <button
            type="button"
            onClick={() => setLegalOpen(true)}
            className="text-2xs tracking-lux uppercase text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            Mentions légales
          </button>
        </div>
      </div>
      <LegalModal open={legalOpen} onClose={() => setLegalOpen(false)} />
    </footer>
  );
}
