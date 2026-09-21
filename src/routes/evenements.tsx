import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/events/event-card";
import { EventOverlay } from "@/components/events/event-overlay";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/lib/server/catalog";
import type { EventItem } from "@/lib/types";

export const Route = createFileRoute("/evenements")({
  component: EventsPage,
  head: () => ({
    meta: [{ title: "Événements — Outlaw" }],
  }),
});

function EventsPage() {
  const [selected, setSelected] = useState<EventItem | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["events"],
    queryFn: () => listEvents(),
  });
  const events = data ?? [];
  const featured = events[0];
  const rest = events.slice(1);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <header className="mb-12 max-w-3xl">
        <p className="text-2xs tracking-lux uppercase text-muted-foreground md:text-xs">
          Fil d'actualité
        </p>
        <h1 className="mt-3 font-display text-5xl font-extrabold tracking-display md:text-7xl">
          Événements
        </h1>
      </header>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-80 w-full" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      ) : isError ? (
        <p className="text-sm text-destructive">
          Impossible de charger les événements.
        </p>
      ) : events.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center border border-dashed border-border px-6 py-16 text-center">
          <h2 className="font-display text-3xl font-medium italic">
            Aucun événement annoncé pour le moment
          </h2>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Les prochaines dates apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {featured ? (
            <EventCard
              event={featured}
              featured
              index={0}
              onOpen={setSelected}
            />
          ) : null}
          {rest.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {rest.map((event, i) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={i + 1}
                  onOpen={setSelected}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}

      <EventOverlay event={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
