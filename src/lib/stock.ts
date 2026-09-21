import type { EventItem } from "@/lib/types";

const EVENT_STOCK = [
  "/stock/crowd.jpg",
  "/stock/stage.jpg",
  "/stock/party.jpg",
  "/stock/singer.jpg",
  "/stock/hands.jpg",
  "/stock/lights.jpg",
] as const;

export const HERO_IMAGE = "/hero.jpg";

export function eventCover(event: EventItem) {
  if (event.bannerUrl) return { src: event.bannerUrl, stock: false };
  return {
    src: EVENT_STOCK[Math.abs(event.id) % EVENT_STOCK.length],
    stock: true,
  };
}
