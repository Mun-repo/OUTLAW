import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEventWhen, isEventEnded } from "@/lib/format";
import { eventCover } from "@/lib/stock";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/lib/types";

export function EventCard({
  event,
  onOpen,
  featured = false,
  index,
}: {
  event: EventItem;
  onOpen?: (event: EventItem) => void;
  featured?: boolean;
  index?: number;
}) {
  const cover = eventCover(event);
  const ended = isEventEnded(event);

  return (
    <article
      className={cn(
        "media-card group relative cursor-pointer overflow-hidden bg-card",
        ended && "is-ended",
      )}
      onClick={() => onOpen?.(event)}
    >
      <div
        className={cn(
          "relative isolate overflow-hidden bg-secondary",
          featured
            ? "aspect-[5/4] md:aspect-[21/9]"
            : "aspect-[5/4] md:aspect-[16/10]",
        )}
      >
        <img
          src={cover.src}
          alt=""
          className={cn(
            "size-full object-cover",
            ended ? "event-stock" : "event-live",
          )}
        />
        <div className="photo-grain" />
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            featured
              ? "bg-gradient-to-t from-ink via-ink/75 to-ink/25 group-hover:opacity-90"
              : "bg-gradient-to-t from-ink via-ink/70 to-ink/20 group-hover:opacity-90",
          )}
        />
        {ended ? (
          <div className="ended-banner" aria-hidden="true">
            <span>Terminé</span>
          </div>
        ) : null}
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-end",
            featured ? "p-6 md:p-10" : "p-5 md:p-7",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium tracking-lux uppercase text-pure md:text-sm">
              {formatEventWhen(event.eventDate, event.eventTime)}
            </p>
            {index != null ? (
              <p className="feed-index text-2xs text-pure/70">
                {String(index + 1).padStart(2, "0")}
              </p>
            ) : null}
          </div>
          <h3
            className={cn(
              "mt-2 font-display font-extrabold leading-[0.92] tracking-display text-pure",
              featured
                ? "text-4xl md:text-6xl lg:text-7xl"
                : "text-3xl md:text-4xl",
            )}
          >
            {event.title}
          </h3>
          {event.location ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-pure md:text-base">
              <MapPin className="size-4 shrink-0" />
              {event.location}
            </p>
          ) : null}
          {event.description ? (
            <p
              className={cn(
                "mt-2 leading-relaxed text-pure/90",
                featured
                  ? "line-clamp-3 max-w-2xl text-base md:text-lg"
                  : "line-clamp-2 max-w-lg text-sm md:text-base",
              )}
            >
              {event.description}
            </p>
          ) : null}
          {onOpen ? (
            <Button
              variant="outline"
              disabled={ended}
              className="mt-5 w-full border-pure/40 bg-ink/40 text-pure backdrop-blur-sm hover:bg-pure hover:text-ink md:w-auto"
              onClick={(e) => {
                e.stopPropagation();
                onOpen(event);
              }}
            >
              {ended ? "Terminé" : "S'inscrire"}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
