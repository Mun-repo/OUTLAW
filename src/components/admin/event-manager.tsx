import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fileToOptimizedDataUrl } from "@/lib/image";
import { formatEventWhen, isEventEnded } from "@/lib/format";
import {
  createEvent,
  deleteEvent,
  listEvents,
  reorderEvents,
  updateEvent,
} from "@/lib/server/catalog";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

type FormState = {
  title: string;
  eventDate: string;
  eventTime: string;
  location: string;
  description: string;
  bannerUrl: string;
  organizer: string;
  guidelines: string;
  ended: boolean;
};

const emptyForm: FormState = {
  title: "",
  eventDate: "",
  eventTime: "22:00",
  location: "",
  description: "",
  bannerUrl: "",
  organizer: "",
  guidelines: "",
  ended: false,
};

function toForm(event?: EventItem): FormState {
  if (!event) return emptyForm;
  return {
    title: event.title,
    eventDate: event.eventDate.slice(0, 10),
    eventTime: event.eventTime || "22:00",
    location: event.location,
    description: event.description,
    bannerUrl: event.bannerUrl ?? "",
    organizer: event.organizer ?? "",
    guidelines: event.guidelines ?? "",
    ended: event.ended,
  };
}

export function EventManager({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const eventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: () => listEvents(),
  });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [fileKey, setFileKey] = useState(0);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<EventItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 140, tolerance: 8 },
    }),
  );

  const events = eventsQuery.data ?? [];
  const ids = useMemo(() => events.map((event) => event.id), [events]);

  const createMutation = useMutation({
    mutationFn: (payload: FormState) =>
      createEvent({
        data: {
          token,
          title: payload.title,
          eventDate: payload.eventDate,
          eventTime: payload.eventTime,
          location: payload.location,
          description: payload.description,
          bannerUrl: payload.bannerUrl.trim() || null,
          organizer: payload.organizer,
          guidelines: payload.guidelines,
          ended: payload.ended,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setForm(emptyForm);
      setFileKey((k) => k + 1);
      toast.success("Événement créé");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FormState }) =>
      updateEvent({
        data: {
          token,
          id,
          title: payload.title,
          eventDate: payload.eventDate,
          eventTime: payload.eventTime,
          location: payload.location,
          description: payload.description,
          bannerUrl: payload.bannerUrl.trim() || null,
          organizer: payload.organizer,
          guidelines: payload.guidelines,
          ended: payload.ended,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setEditing(null);
      toast.success("Événement mis à jour");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteEvent({ data: { token, id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["events"] });
      setPendingDelete(null);
      toast.success("Événement supprimé");
    },
    onError: (err: Error) => toast.error(err.message || "Erreur"),
  });

  const reorderMutation = useMutation({
    mutationFn: (nextIds: number[]) => reorderEvents({ data: { token, ids: nextIds } }),
    onSuccess: (next) => {
      queryClient.setQueryData(["events"], next);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Réordonnancement impossible");
    },
  });

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = events.findIndex((item) => item.id === active.id);
    const newIndex = events.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const previous = events;
    const next = arrayMove(events, oldIndex, newIndex);
    queryClient.setQueryData(["events"], next);
    reorderMutation.mutate(next.map((item) => item.id), {
      onError: () => {
        queryClient.setQueryData(["events"], previous);
      },
    });
  }

  function submitCreate(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || !form.eventDate) return;
    createMutation.mutate(form);
  }

  function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    updateMutation.mutate({ id: editing.id, payload: editForm });
  }

  async function onPickBanner(file: File | undefined, target: "create" | "edit") {
    if (!file) return;
    try {
      const url = await fileToOptimizedDataUrl(file);
      if (target === "create") setForm((f) => ({ ...f, bannerUrl: url }));
      else setEditForm((f) => ({ ...f, bannerUrl: url }));
    } catch {
      toast.error("Impossible de lire la bannière");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <form
        onSubmit={submitCreate}
        className="h-fit rounded-xl border border-border bg-card p-5"
      >
        <div className="mb-5 flex items-center gap-2">
          <Plus className="size-4" />
          <h2 className="font-display text-xl font-medium">Nouvel événement</h2>
        </div>
        <EventFields
          idPrefix="create"
          fileKey={fileKey}
          form={form}
          onChange={setForm}
          onFile={(file) => onPickBanner(file, "create")}
        />
        <Button
          type="submit"
          className="mt-5 w-full"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? "Création…" : "Créer l'événement"}
        </Button>
      </form>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Maintenez le clic sur une carte pour réordonner le fil d'actualité.
        </p>
        {eventsQuery.isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
            Aucun événement pour le moment.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-4">
                {events.map((event) => (
                  <SortableEventRow
                    key={event.id}
                    event={event}
                    onEdit={() => {
                      setEditing(event);
                      setEditForm(toForm(event));
                    }}
                    onDelete={() => setPendingDelete(event)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>
              Mise à jour des informations, de la bannière et du statut.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitEdit} className="flex flex-col gap-4">
            <EventFields
              idPrefix="edit"
              fileKey={0}
              form={editForm}
              onChange={setEditForm}
              onFile={(file) => onPickBanner(file, "edit")}
            />
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet événement ?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `« ${pendingDelete.title} » sera retiré du calendrier.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function SortableEventRow({
  event,
  onEdit,
  onDelete,
}: {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: event.id });
  const ended = isEventEnded(event);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card",
        isDragging && "opacity-70 shadow-[0_0_0_1px_var(--color-pure)]",
      )}
    >
      {event.bannerUrl ? (
        <div className={cn("relative", ended && "is-ended")}>
          <img
            src={event.bannerUrl}
            alt=""
            className={cn("h-28 w-full object-cover", ended && "grayscale")}
          />
          {ended ? (
            <div className="ended-banner">
              <span>Terminé</span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className="flex gap-3 p-4">
        <button
          type="button"
          className="mt-1 flex size-9 shrink-0 items-center justify-center border border-border text-muted-foreground hover:text-foreground"
          aria-label="Réordonner"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs tracking-lux uppercase text-muted-foreground">
            {formatEventWhen(event.eventDate, event.eventTime)}
          </p>
          <p className="mt-1 font-medium">{event.title}</p>
          {event.location ? (
            <p className="text-sm text-muted-foreground">{event.location}</p>
          ) : null}
          {ended ? (
            <p className="mt-1 text-2xs tracking-lux uppercase text-muted-foreground">
              Terminé
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Button variant="outline" size="icon-sm" aria-label="Modifier" onClick={onEdit}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Supprimer"
            onClick={onDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function EventFields({
  idPrefix,
  fileKey,
  form,
  onChange,
  onFile,
}: {
  idPrefix: string;
  fileKey: number;
  form: FormState;
  onChange: (next: FormState) => void;
  onFile: (file: File | undefined) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-title`}>Titre</Label>
        <Input
          id={`${idPrefix}-title`}
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-date`}>Date</Label>
        <Input
          id={`${idPrefix}-date`}
          type="date"
          value={form.eventDate}
          onChange={(e) => onChange({ ...form, eventDate: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-time`}>Heure</Label>
        <Input
          id={`${idPrefix}-time`}
          type="time"
          value={form.eventTime}
          onChange={(e) => onChange({ ...form, eventTime: e.target.value })}
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-location`}>Lieu</Label>
        <Input
          id={`${idPrefix}-location`}
          value={form.location}
          onChange={(e) => onChange({ ...form, location: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-organizer`}>Organisateur</Label>
        <Input
          id={`${idPrefix}-organizer`}
          value={form.organizer}
          onChange={(e) => onChange({ ...form, organizer: e.target.value })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-description`}>Description</Label>
        <Textarea
          id={`${idPrefix}-description`}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          rows={4}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-guidelines`}>Consignes (dress code, âge…)</Label>
        <Textarea
          id={`${idPrefix}-guidelines`}
          value={form.guidelines}
          onChange={(e) => onChange({ ...form, guidelines: e.target.value })}
          rows={3}
        />
      </div>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-primary"
          checked={form.ended}
          onChange={(e) => onChange({ ...form, ended: e.target.checked })}
        />
        Marquer comme terminé
      </label>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-banner-file`}>Bannière (fichier)</Label>
        <Input
          id={`${idPrefix}-banner-file`}
          key={fileKey}
          type="file"
          accept="image/*"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>
      {form.bannerUrl ? (
        <img
          src={form.bannerUrl}
          alt="Aperçu de la bannière"
          className="h-36 w-full rounded-md object-cover"
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Importez une image pour prévisualiser la bannière.
        </p>
      )}
    </div>
  );
}
