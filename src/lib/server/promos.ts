import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { asIso } from "@/lib/format";
import { assertAdminToken } from "@/lib/server/admin";
import type { PromoCode, PromoKind } from "@/lib/types";

type PromoRow = {
  id: number;
  code: string;
  kind: string;
  value: string | number;
  description: string;
  active: boolean;
  created_at: unknown;
};

function mapPromo(row: PromoRow): PromoCode {
  const kind = (
    row.kind === "fixed" || row.kind === "access" ? row.kind : "percent"
  ) as PromoKind;
  return {
    id: row.id,
    code: row.code,
    kind,
    value: typeof row.value === "number" ? row.value : Number(row.value),
    description: row.description,
    active: Boolean(row.active),
    createdAt: asIso(row.created_at),
  };
}

export const listPromoCodes = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const rows = await sql<PromoRow>`
      select id, code, kind, value, description, active, created_at
      from promo_codes
      order by created_at desc
    `;
    return rows.map(mapPromo);
  });

export const createPromoCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      code: z.string().trim().min(2).max(32),
      kind: z.enum(["percent", "fixed", "access"]),
      value: z.number().min(0),
      description: z.string(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<PromoRow>`
      insert into promo_codes (code, kind, value, description, active)
      values (${code}, ${data.kind}, ${data.value}, ${data.description}, ${data.active})
      returning id, code, kind, value, description, active, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Création impossible");
    return mapPromo(row);
  });

export const updatePromoCode = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      id: z.number(),
      code: z.string().trim().min(2).max(32),
      kind: z.enum(["percent", "fixed", "access"]),
      value: z.number().min(0),
      description: z.string(),
      active: z.boolean(),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<PromoRow>`
      update promo_codes
      set code = ${code},
          kind = ${data.kind},
          value = ${data.value},
          description = ${data.description},
          active = ${data.active}
      where id = ${data.id}
      returning id, code, kind, value, description, active, created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Code introuvable");
    return mapPromo(row);
  });

export const deletePromoCode = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    await sql`delete from promo_codes where id = ${data.id}`;
    return { ok: true };
  });

export const redeemPromoCode = createServerFn({ method: "POST" })
  .validator(z.object({ code: z.string().trim().min(1) }))
  .handler(async ({ data }) => {
    const sql = await getSql();
    const code = data.code.trim().toUpperCase();
    const rows = await sql<PromoRow>`
      select id, code, kind, value, description, active, created_at
      from promo_codes
      where lower(code) = ${code.toLowerCase()}
    `;
    const row = rows[0];
    if (!row || !row.active) throw new Error("Code invalide ou expiré");
    return mapPromo(row);
  });
