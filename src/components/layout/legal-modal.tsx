import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function LegalModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent
        overlayClassName="bg-ink/70 backdrop-blur-md"
        className="max-h-[min(90vh,42rem)] max-w-2xl gap-0 overflow-y-auto border-border bg-ink p-0 text-pure"
      >
        <div className="border-b border-border px-6 py-8 pr-16 md:px-10">
          <DialogHeader>
            <p className="text-2xs tracking-lux uppercase text-muted-foreground">
              Association loi 1901
            </p>
            <DialogTitle className="mt-3 font-display text-3xl font-extrabold tracking-display md:text-4xl">
              Mentions légales
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Éditeur, siège social, hébergement et protection des données
              personnelles.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col gap-10 px-6 py-8 md:px-10 md:py-10">
          <section className="grid gap-6 md:grid-cols-2">
            <LegalBlock label="Éditeur">
              <p>Association Outlaw</p>
              <p className="mt-2 text-muted-foreground">
                Association loi 1901
                <br />
                RNA W923012569
              </p>
            </LegalBlock>
            <LegalBlock label="Siège social">
              <p>
                2 allée des Moulineaux
                <br />
                92130 Issy-les-Moulineaux
                <br />
                France
              </p>
            </LegalBlock>
            <LegalBlock label="Publication">
              <p>Rita Loulidi</p>
              <p className="mt-2 text-muted-foreground">
                Directrice de la publication.
              </p>
            </LegalBlock>
            <LegalBlock label="Contact">
              <a
                href="mailto:outlawfld@gmail.com"
                className="underline-offset-4 hover:text-pure hover:underline"
              >
                outlawfld@gmail.com
              </a>
            </LegalBlock>
            <LegalBlock label="Hébergement" className="md:col-span-2">
              <p>Vercel Inc.</p>
              <p className="mt-2 text-muted-foreground">
                440 N Barranca Ave #4133
                <br />
                Covina, CA 91723, USA
              </p>
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block underline-offset-4 hover:text-pure hover:underline"
              >
                vercel.com
              </a>
            </LegalBlock>
          </section>

          <section className="border-t border-border pt-8">
            <p className="text-2xs tracking-lux uppercase text-muted-foreground">
              Protection des données · RGPD
            </p>
            <div className="mt-4 max-w-prose space-y-4 text-sm leading-relaxed text-foreground/90">
              <p>
                Les informations collectées lors des inscriptions aux
                événements ou des commandes en boutique (nom, prénom, e-mail)
                sont strictement destinées à la gestion interne par
                l'Association Outlaw et au traitement des
                transactions / envois.
              </p>
              <p>
                Aucune donnée n'est cédée ou vendue à des tiers.
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LegalBlock({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-border pt-4", className)}>
      <p className="text-2xs tracking-lux uppercase text-muted-foreground">
        {label}
      </p>
      <div className="mt-3 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
