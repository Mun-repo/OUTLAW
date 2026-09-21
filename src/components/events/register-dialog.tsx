import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { formatEventWhen } from "@/lib/format";
import { registerForEvent } from "@/lib/server/registrations";
import type { EventItem } from "@/lib/types";

export function RegisterDialog({
  event,
  onClose,
}: {
  event: EventItem | null;
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
          eventId: event!.id,
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

  function reset() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setError(null);
    mutation.reset();
  }

  function handleOpen(open: boolean) {
    if (!open) {
      reset();
      onClose();
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!event) return;
    mutation.mutate();
  }

  const confirmed = mutation.data;

  return (
    <Dialog open={!!event} onOpenChange={handleOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        {confirmed ? (
          <div className="flex flex-col gap-5">
            <DialogHeader>
              <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                Confirmation
              </p>
              <DialogTitle className="font-display text-3xl">
                Vous êtes inscrit.
              </DialogTitle>
              <DialogDescription>
                Un e-mail de confirmation a été préparé pour{" "}
                {confirmed.registration.email}.
              </DialogDescription>
            </DialogHeader>
            <div className="border border-border bg-secondary/40 p-5">
              <p className="text-2xs tracking-lux uppercase text-muted-foreground">
                {confirmed.when}
              </p>
              <p className="mt-2 font-display text-2xl">
                {confirmed.registration.eventTitle}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {confirmed.location}
              </p>
              <p className="mt-5 font-mono text-sm tracking-[0.28em]">
                {confirmed.registration.ticketCode}
              </p>
            </div>
            <div className="overflow-hidden border border-border">
              <iframe
                title="Aperçu de l'e-mail"
                className="h-80 w-full bg-background"
                srcDoc={confirmed.emailHtml}
              />
            </div>
            <Button onClick={() => handleOpen(false)}>Fermer</Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <DialogHeader>
              <DialogTitle>S'inscrire</DialogTitle>
              <DialogDescription>
                {event
                  ? `${event.title} — ${formatEventWhen(event.eventDate, event.eventTime)}`
                  : null}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
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
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Inscription…" : "Confirmer"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
