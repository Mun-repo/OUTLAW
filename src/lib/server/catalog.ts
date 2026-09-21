import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { asBool, asClock, asDay, asIso } from "@/lib/format";
import { assertAdminToken } from "@/lib/server/admin";
import type { EventItem, Product } from "@/lib/types";

type ProductRow = {
  id: number;
  title: string;
  description: string;
  price: string | number;
  image_url: string | null;
  image_urls: string | null;
  created_at: unknown;
};

type EventRow = {
  id: number;
  title: string;
  event_date: unknown;
  event_time: unknown;
  location: string;
  description: string;
  banner_url: string | null;
  organizer: string | null;
  guidelines: string | null;
  ended: unknown;
  sort_order: number | string | null;
  created_at: unknown;
};

function parseImageUrls(raw: unknown, fallback: string | null): string[] {
  let parsed: unknown = [];
  if (typeof raw === "string" && raw.trim()) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = [];
    }
  } else if (Array.isArray(raw)) {
    parsed = raw;
  }
  const urls = Array.isArray(parsed)
    ? parsed.filter((url): url is string => typeof url === "string" && url.trim().length > 0)
    : [];
  if (urls.length === 0 && fallback) return [fallback];
  return urls;
}

function mapProduct(row: ProductRow): Product {
  const imageUrls = parseImageUrls(row.image_urls, row.image_url);
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: typeof row.price === "number" ? row.price : Number(row.price),
    imageUrl: imageUrls[0] ?? row.image_url,
    imageUrls,
    createdAt: asIso(row.created_at),
  };
}

function mapEvent(row: EventRow): EventItem {
  return {
    id: row.id,
    title: row.title,
    eventDate: asDay(row.event_date),
    eventTime: asClock(row.event_time),
    location: row.location ?? "",
    description: row.description ?? "",
    bannerUrl: row.banner_url,
    organizer: row.organizer ?? "",
    guidelines: row.guidelines ?? "",
    ended: asBool(row.ended),
    sortOrder: Number(row.sort_order ?? 0),
    createdAt: asIso(row.created_at),
  };
}

const productInput = z.object({
  token: z.string(),
  title: z.string().trim().min(1, "Le titre est requis"),
  description: z.string(),
  price: z.number().min(0, "Le prix doit être positif"),
  imageUrl: z.string().nullable(),
  imageUrls: z.array(z.string()).optional(),
});

const eventInput = z.object({
  token: z.string(),
  title: z.string().trim().min(1, "Le titre est requis"),
  eventDate: z.string().min(1, "La date est requise"),
  eventTime: z.string().min(1, "L'heure est requise"),
  location: z.string(),
  description: z.string(),
  bannerUrl: z.string().nullable(),
  organizer: z.string().optional(),
  guidelines: z.string().optional(),
  ended: z.boolean().optional(),
});

function productMedia(data: { imageUrl: string | null; imageUrls?: string[] }) {
  const urls = (data.imageUrls ?? []).filter((url) => url.trim().length > 0);
  const primary = urls[0] ?? data.imageUrl;
  const imageUrls = urls.length > 0 ? urls : primary ? [primary] : [];
  return {
    imageUrl: imageUrls[0] ?? null,
    imageUrlsJson: JSON.stringify(imageUrls),
  };
}

export const listProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      select id, title, description, price, image_url, image_urls, created_at
      from products
      order by created_at desc, id desc
    `;
    return rows.map(mapProduct);
  },
);

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const rows = await sql<EventRow>`
    select id, title, event_date, event_time, location, description, banner_url,
           organizer, guidelines, ended, sort_order, created_at
    from events
    order by sort_order asc, event_date asc, id asc
  `;
  return rows.map(mapEvent);
});

export const createProduct = createServerFn({ method: "POST" })
  .validator(productInput)
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const media = productMedia(data);
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      insert into products (title, description, price, image_url, image_urls)
      values (${data.title}, ${data.description}, ${data.price}, ${media.imageUrl}, ${media.imageUrlsJson})
      returning id, title, description, price, image_url, image_urls, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Création impossible");
    return mapProduct(row);
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator(productInput.extend({ id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const media = productMedia(data);
    const sql = await getSql();
    const rows = await sql<ProductRow>`
      update products
      set title = ${data.title},
          description = ${data.description},
          price = ${data.price},
          image_url = ${media.imageUrl},
          image_urls = ${media.imageUrlsJson},
          updated_at = now()
      where id = ${data.id}
      returning id, title, description, price, image_url, image_urls, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Article introuvable");
    return mapProduct(row);
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    await sql`delete from products where id = ${data.id}`;
    return { ok: true };
  });

export const createEvent = createServerFn({ method: "POST" })
  .validator(eventInput)
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const next = await sql<{ n: number }>`
      select coalesce(max(sort_order), 0) + 1 as n from events
    `;
    const sortOrder = Number(next[0]?.n ?? 1);
    const rows = await sql<EventRow>`
      insert into events (
        title, event_date, event_time, location, description, banner_url,
        organizer, guidelines, ended, sort_order
      )
      values (
        ${data.title}, ${data.eventDate}, ${data.eventTime}, ${data.location},
        ${data.description}, ${data.bannerUrl}, ${data.organizer ?? ""},
        ${data.guidelines ?? ""}, ${data.ended ?? false}, ${sortOrder}
      )
      returning id, title, event_date, event_time, location, description, banner_url,
                organizer, guidelines, ended, sort_order, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Création impossible");
    return mapEvent(row);
  });

export const updateEvent = createServerFn({ method: "POST" })
  .validator(eventInput.extend({ id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const rows = await sql<EventRow>`
      update events
      set title = ${data.title},
          event_date = ${data.eventDate},
          event_time = ${data.eventTime},
          location = ${data.location},
          description = ${data.description},
          banner_url = ${data.bannerUrl},
          organizer = ${data.organizer ?? ""},
          guidelines = ${data.guidelines ?? ""},
          ended = ${data.ended ?? false},
          updated_at = now()
      where id = ${data.id}
      returning id, title, event_date, event_time, location, description, banner_url,
                organizer, guidelines, ended, sort_order, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Événement introuvable");
    return mapEvent(row);
  });

export const deleteEvent = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    await sql`delete from events where id = ${data.id}`;
    return { ok: true };
  });

export const reorderEvents = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), ids: z.array(z.number()) }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    for (let i = 0; i < data.ids.length; i += 1) {
      const id = data.ids[i];
      if (id == null) continue;
      await sql`update events set sort_order = ${i + 1}, updated_at = now() where id = ${id}`;
    }
    const rows = await sql<EventRow>`
      select id, title, event_date, event_time, location, description, banner_url,
             organizer, guidelines, ended, sort_order, created_at
      from events
      order by sort_order asc, event_date asc, id asc
    `;
    return rows.map(mapEvent);
  });
