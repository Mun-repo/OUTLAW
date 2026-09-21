import type { EventItem } from "@/lib/types";
import heroUrl from "@/assets/hero.jpg";
import crowdUrl from "@/assets/stock/crowd.jpg";
import stageUrl from "@/assets/stock/stage.jpg";
import partyUrl from "@/assets/stock/party.jpg";
import singerUrl from "@/assets/stock/singer.jpg";
import handsUrl from "@/assets/stock/hands.jpg";
import lightsUrl from "@/assets/stock/lights.jpg";

const EVENT_STOCK = [
  crowdUrl,
  stageUrl,
  partyUrl,
  singerUrl,
  handsUrl,
  lightsUrl,
] as const;

export const HERO_IMAGE = heroUrl;

export function eventCover(event: EventItem) {
  if (event.bannerUrl) return { src: event.bannerUrl, stock: false };
  return {
    src: EVENT_STOCK[Math.abs(event.id) % EVENT_STOCK.length],
    stock: true,
  };
}
