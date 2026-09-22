import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import type { EventItem } from "@/lib/types";

export function asIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  if (value == null) return "";
  return String(value);
}

export function asDay(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const s = asIso(value);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function asClock(value: unknown): string {
  if (value == null || value === "") return "22:00";
  if (value instanceof Date) {
    return `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`;
  }
  const match = String(value).match(/(\d{1,2}):(\d{2})/);
  if (!match) return "22:00";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

export function asBool(value: unknown): boolean {
  return value === true || value === "t" || value === "true" || value === 1 || value === "1";
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatOrderNumber(value: string) {
  const code = value.replace(/^#/, "").trim().toUpperCase();
  return code ? `#${code}` : "";
}

export function formatEventDate(isoDate: unknown) {
  try {
    const day = asDay(isoDate);
    const parsed = day.length <= 10 ? parseISO(day) : new Date(day);
    return format(parsed, "d MMMM yyyy", { locale: fr });
  } catch {
    return asIso(isoDate);
  }
}

export function formatEventTime(time: unknown) {
  const clock = asClock(time);
  const [h = "00", m = "00"] = clock.split(":");
  return `${h.padStart(2, "0")}H${m.padStart(2, "0")}`;
}

export function formatEventWhen(isoDate: unknown, time?: unknown) {
  try {
    const daySrc = asDay(isoDate);
    const parsed = parseISO(daySrc);
    const day = format(parsed, "d MMM yyyy", { locale: fr })
      .replaceAll(".", "")
      .toUpperCase();
    const clock = formatEventTime(time);
    return clock ? `${day} · ${clock}` : day;
  } catch {
    return asIso(isoDate);
  }
}

export function formatRegisteredAt(value: unknown) {
  const raw = asIso(value);
  try {
    return format(parseISO(raw), "d MMM yyyy HH:mm", { locale: fr });
  } catch {
    return raw;
  }
}

export function eventOccursAt(eventDate: unknown, eventTime?: unknown): Date {
  const day = asDay(eventDate);
  const clock = asClock(eventTime);
  const utc = new Date(`${day}T${clock}:00.000Z`);
  if (Number.isNaN(utc.getTime())) return utc;
  const asParis = new Date(
    utc.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
  );
  return new Date(utc.getTime() + (utc.getTime() - asParis.getTime()));
}

export function isEventPast(eventDate: unknown, eventTime?: unknown): boolean {
  const at = eventOccursAt(eventDate, eventTime);
  if (Number.isNaN(at.getTime())) return false;
  return at.getTime() < Date.now();
}

export function isEventEnded(
  event: Pick<EventItem, "ended" | "eventDate" | "eventTime">,
): boolean {
  return event.ended || isEventPast(event.eventDate, event.eventTime);
}
