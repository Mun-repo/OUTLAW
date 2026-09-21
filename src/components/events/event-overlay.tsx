import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Shield, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatEventDate,
  formatEventTime,
  formatEventWhen,
  isEventEnded,
} from "@/lib/format";
import { registerForEvent } from "@/lib/server/registrations";
import { eventCover } from "@/lib/stock";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

export function EventOverlay({
  event,
  onClose,
}: {
  event: EventItem | null;
  onClose: () => void;
}) {
  function handleOpen(open: boolean) {
    if (!open) onClose();
  }

  return (
    <Dialog open={!!event} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1.5rem)] max-w-5xl overflow-hidden p-0 sm:max-w-5xl">
        {event ? <EventOverlayBody key={event.id} event={event} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EventOverlayBody({
  event,
  onClose,
}: {
  event: EventItem;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      registerForEvent({
        data: {
          eventId: event.id,
          firstName,
          lastName,
          email,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["registrations"] });
      setError(null);
    },
    onError: (err: Error) => setError(err.message || "Inscription impossible"),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  const confirmed = mutation.data;
  const ended = isEventEnded(event);
  const cover = eventCover(event);

  return (
    <div className="grid max-h-[92vh] md:grid-cols-[1.12fr_1fr]">
      <div
        className={cn(
          "relative isolate min-h-56 overflow-hidden bg-secondary md:min-h-[min(92vh,40rem)]",
          ended && "is-ended",
        )}
      >
        <img
          src={cover.src}
          alt=""
          className={cn("event-stock size-full object-cover", ended && "grayscale")}
        />
        <div className="photo-grain" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20 md:bg-gradient-to-r md:from-transparent md:to-ink/30" />
        {ended ? (
          <div className="ended-banner" aria-hidden="true">
            <span>Terminé</span>
          </div>
        ) : null}
      </div>

      <div className="flex max-h-[92vh] flex-col overflow-y-auto bg-card pr-4 md:max-h-[min(92vh,40rem)]">
        {confirmed ? (
          <div className="flex flex-col gap-5 p-6 pt-16 md:p-8 md:pt-16">
            <DialogHeader>
              <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                Confirmation
              </p>
              <DialogTitle className="font-display text-3xl font-extrabold tracking-display">
                Vous êtes inscrit.
              </DialogTitle>
              <DialogDescription>
                Un e-mail de confirmation a été préparé pour {confirmed.registration.email}.
              </DialogDescription>
            </DialogHeader>
            <div className="border border-border bg-secondary/40 p-5">
              <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                {confirmed.when}
              </p>
              <p className="mt-2 font-display text-2xl">{confirmed.registration.eventTitle}</p>
              <p className="mt-3 text-sm text-muted-foreground">{confirmed.location}</p>
              <p className="mt-5 font-mono text-sm tracking-[0.28em]">
                {confirmed.registration.ticketCode}
              </p>
            </div>
            <div className="overflow-hidden border border-border">
              <iframe
                title="Aperçu de l'e-mail"
                className="h-64 w-full bg-background"
                srcDoc={confirmed.emailHtml}
              />
            </div>
            <Button onClick={onClose}>Fermer</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 p-6 pt-16 md:p-8 md:pt-16">
            <DialogHeader>
              <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                {formatEventWhen(event.eventDate, event.eventTime)}
              </p>
              <DialogTitle className="font-display text-3xl font-extrabold leading-tight tracking-display md:text-4xl">
                {event.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Détails et inscription — {event.title}
              </DialogDescription>
            </DialogHeader>

            <ul className="flex flex-col gap-3 text-sm text-foreground">
              <li className="flex items-start gap-3">
                <Calendar className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span className="capitalize">{formatEventDate(event.eventDate)}</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <span>{formatEventTime(event.eventTime)}</span>
              </li>
              {event.location ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{event.location}</span>
                </li>
              ) : null}
              {event.organizer ? (
                <li className="flex items-start gap-3">
                  <User className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span>{event.organizer}</span>
                </li>
              ) : null}
              {event.guidelines ? (
                <li className="flex items-start gap-3">
                  <Shield className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="whitespace-pre-line">{event.guidelines}</span>
                </li>
              ) : null}
            </ul>

            {event.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {event.description}
              </p>
            ) : null}

            {ended ? (
              <p className="border border-border bg-secondary/50 px-4 py-4 text-sm text-muted-foreground">
                Cet événement est terminé. Les inscriptions sont closes.
              </p>
            ) : (
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 border-t border-border pt-5"
              >
                <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                  Inscription
                </p>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-last">Nom</Label>
                  <Input
                    id="reg-last"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-first">Prénom</Label>
                  <Input
                    id="reg-first"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Inscription…" : "Confirmer l'inscription"}
                </Button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
