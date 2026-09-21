import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listEvents } from "@/lib/server/catalog";
import { listRegistrations, sendMassEmail } from "@/lib/server/registrations";
import { formatRegisteredAt } from "@/lib/format";

export function RegistrationsPanel({ token }: { token: string }) {
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [massOpen, setMassOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => listEvents(),
  });
  const eventId = eventFilter === "all" ? undefined : Number(eventFilter);

  const regsQuery = useQuery({
    queryKey: ["registrations", eventId ?? "all"],
    queryFn: () => listRegistrations({ data: { token, eventId } }),
  });

  const rows = regsQuery.data ?? [];
  const events = eventsQuery.data ?? [];

  const csv = useMemo(() => {
    const header = [
      "Nom",
      "Prénom",
      "E-mail",
      "Événement",
      "Billet",
      "Date d'inscription",
    ];
    const body = rows.map((r) =>
      [
        r.lastName,
        r.firstName,
        r.email,
        r.eventTitle,
        r.ticketCode,
        formatRegisteredAt(r.createdAt),
      ]
        .map((v) => `"${String(v).replaceAll('"', '""')}"`)
        .join(","),
    );
    return [header.join(","), ...body].join("\n");
  }, [rows]);

  function exportCsv() {
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "outlaw-inscriptions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const massMutation = useMutation({
    mutationFn: () =>
      sendMassEmail({
        data: {
          token,
          eventId: Number(eventFilter),
          subject,
          message,
        },
      }),
    onSuccess: (result) => {
      toast.success(
        result.delivered > 0
          ? `${result.delivered} e-mail(s) envoyés`
          : "E-mail généré (envoi Resend en attente de clé)",
      );
      setMassOpen(false);
      setSubject("");
      setMessage("");
    },
    onError: (err: Error) => toast.error(err.message || "Envoi impossible"),
  });

  function onMass(e: FormEvent) {
    e.preventDefault();
    massMutation.mutate();
  }

  const canMass = eventFilter !== "all" && rows.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Label htmlFor="reg-filter">Événement</Label>
          <select
            id="reg-filter"
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="h-11 min-w-56 rounded-md border border-input bg-secondary/40 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <option value="all">Tous les événements</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={rows.length === 0}
          >
            <Download className="size-4" />
            Export CSV
          </Button>
          <Button onClick={() => setMassOpen(true)} disabled={!canMass}>
            <Mail className="size-4" />
            Send Mass Email
          </Button>
        </div>
      </div>

      {regsQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : rows.length === 0 ? (
        <p className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
          Aucune inscription.
        </p>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-border bg-secondary/40 text-2xs tracking-lux uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Événement</th>
                <th className="px-4 py-3 font-medium">Inscription</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {row.lastName} {row.firstName}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{row.email}</td>
                  <td className="px-4 py-3">{row.eventTitle}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {formatRegisteredAt(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={massOpen} onOpenChange={setMassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Mass Email</DialogTitle>
            <DialogDescription>
              Message envoyé à tous les inscrits de l'événement sélectionné.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onMass} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="mass-subject">Sujet</Label>
              <Input
                id="mass-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="mass-body">Message</Label>
              <Textarea
                id="mass-body"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
              />
            </div>
            <Button type="submit" disabled={massMutation.isPending}>
              {massMutation.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
