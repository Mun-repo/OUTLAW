import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { asIso, formatPrice } from "@/lib/format";
import { assertAdminToken } from "@/lib/server/admin";
import type { OrderLine, OrderStatus, ShopOrder } from "@/lib/types";

async function stripeApi() {
  const { getStripe, stripeConfigured } = await import("@/lib/server/stripe");
  return { stripe: getStripe(), configured: stripeConfigured() };
}

type OrderRow = {
  id: number;
  order_number: string;
  first_name: string;
  last_name: string;
  email: string;
  items_json: string;
  total: string | number;
  status: string;
  stripe_session_id: string | null;
  created_at: unknown;
};

function parseItems(raw: string): OrderLine[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => ({
        productId: Number((item as OrderLine).productId) || 0,
        title: String((item as OrderLine).title ?? ""),
        quantity: Number((item as OrderLine).quantity) || 0,
        price: Number((item as OrderLine).price) || 0,
      }))
      .filter((item) => item.title && item.quantity > 0);
  } catch {
    return [];
  }
}

function asStatus(value: string): OrderStatus {
  if (value === "delivered" || value === "pickup" || value === "pending") {
    return value;
  }
  return "pickup";
}

function mapOrder(row: OrderRow): ShopOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    items: parseItems(row.items_json),
    total: typeof row.total === "number" ? row.total : Number(row.total),
    status: asStatus(row.status),
    stripeSessionId: row.stripe_session_id,
    createdAt: asIso(row.created_at),
  };
}

async function nextOrderNumber() {
  const sql = await getSql();
  for (let i = 0; i < 24; i += 1) {
    const n = 1000 + Math.floor(Math.random() * 9000);
    const code = `OUTLAW-${n}`;
    const existing = await sql<{ id: number }>`
      select id from orders where order_number = ${code}
    `;
    if (!existing[0]) return code;
  }
  return `OUTLAW-${String(Date.now()).slice(-4)}`;
}

function applyDiscount(subtotal: number, kind: string, value: number) {
  if (kind === "percent") {
    return Math.max(0, subtotal - Math.min(subtotal, (subtotal * value) / 100));
  }
  if (kind === "fixed") {
    return Math.max(0, subtotal - Math.min(subtotal, value));
  }
  return subtotal;
}

async function insertPending(input: {
  firstName: string;
  lastName: string;
  email: string;
  items: OrderLine[];
  total: number;
}) {
  const sql = await getSql();
  const orderNumber = await nextOrderNumber();
  const rows = await sql<OrderRow>`
    insert into orders (
      order_number, first_name, last_name, email, items_json, total, status
    )
    values (
      ${orderNumber}, ${input.firstName}, ${input.lastName}, ${input.email},
      ${JSON.stringify(input.items)}, ${input.total}, ${"pending"}
    )
    returning id, order_number, first_name, last_name, email, items_json, total,
              status, stripe_session_id, created_at
  `;
  const row = rows[0];
  if (!row) throw new Error("Commande impossible");
  return mapOrder(row);
}

async function markPaid(order: ShopOrder, stripeSessionId: string | null) {
  if (order.status === "pickup" || order.status === "delivered") return order;
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    update orders
    set status = ${"pickup"},
        stripe_session_id = coalesce(${stripeSessionId}, stripe_session_id),
        updated_at = now()
    where id = ${order.id} and status = ${"pending"}
    returning id, order_number, first_name, last_name, email, items_json, total,
              status, stripe_session_id, created_at
  `;
  if (!rows[0]) {
    const current = await sql<OrderRow>`
      select id, order_number, first_name, last_name, email, items_json, total,
             status, stripe_session_id, created_at
      from orders where id = ${order.id}
    `;
    return current[0] ? mapOrder(current[0]) : order;
  }
  const paid = mapOrder(rows[0]);
  const { sendOrderConfirmationEmail } = await import("@/lib/server/email");
  await sendOrderConfirmationEmail(paid.email, {
    firstName: paid.firstName,
    orderNumber: paid.orderNumber,
    items: paid.items,
    total: formatPrice(paid.total),
  });
  return paid;
}

export async function fulfillBySessionId(sessionId: string) {
  const sql = await getSql();
  const existing = await sql<OrderRow>`
    select id, order_number, first_name, last_name, email, items_json, total,
           status, stripe_session_id, created_at
    from orders
    where stripe_session_id = ${sessionId}
  `;
  if (existing[0] && asStatus(existing[0].status) !== "pending") {
    return mapOrder(existing[0]);
  }

  const { stripe } = await stripeApi();
  if (!stripe) {
    if (existing[0]) return markPaid(mapOrder(existing[0]), sessionId);
    throw new Error("Session introuvable");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid" && session.status !== "complete") {
    throw new Error("Paiement non confirmé");
  }
  const orderId = Number(session.metadata?.orderId ?? 0);
  if (!orderId) throw new Error("Commande introuvable");
  const rows = await sql<OrderRow>`
    select id, order_number, first_name, last_name, email, items_json, total,
           status, stripe_session_id, created_at
    from orders where id = ${orderId}
  `;
  const row = rows[0];
  if (!row) throw new Error("Commande introuvable");
  return markPaid(mapOrder(row), sessionId);
}

export async function fulfillByOrderNumber(orderNumber: string) {
  const sql = await getSql();
  const code = orderNumber.replace(/^#/, "").trim().toUpperCase();
  const rows = await sql<OrderRow>`
    select id, order_number, first_name, last_name, email, items_json, total,
           status, stripe_session_id, created_at
    from orders
    where order_number = ${code}
  `;
  const row = rows[0];
  if (!row) throw new Error("Commande introuvable");
  const order = mapOrder(row);
  if (order.status !== "pending") return order;
  const { configured } = await stripeApi();
  if (configured) {
    throw new Error("Paiement non confirmé");
  }
  return markPaid(order, order.stripeSessionId);
}

const checkoutInput = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis"),
  lastName: z.string().trim().min(1, "Le nom est requis"),
  email: z.string().trim().email("E-mail invalide"),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
  promoCode: z.string().nullable(),
  origin: z.string().url(),
});

export const startCheckout = createServerFn({ method: "POST" })
  .validator(checkoutInput)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const products = await sql<{
      id: number;
      title: string;
      price: string | number;
    }>`
      select id, title, price from products
    `;
    const byId = new Map(products.map((p) => [p.id, p]));
    const lines: OrderLine[] = [];
    for (const item of data.items) {
      const product = byId.get(item.productId);
      if (!product) throw new Error("Article introuvable");
      const price =
        typeof product.price === "number" ? product.price : Number(product.price);
      lines.push({
        productId: product.id,
        title: product.title,
        quantity: item.quantity,
        price,
      });
    }
    const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    let total = subtotal;
    if (data.promoCode) {
      const promos = await sql<{ kind: string; value: string | number; active: boolean }>`
        select kind, value, active from promo_codes
        where lower(code) = ${data.promoCode.trim().toLowerCase()}
      `;
      const promo = promos[0];
      if (promo && promo.active) {
        total = applyDiscount(
          subtotal,
          promo.kind,
          typeof promo.value === "number" ? promo.value : Number(promo.value),
        );
      }
    }
    total = Math.round(total * 100) / 100;
    const order = await insertPending({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      items: lines,
      total,
    });

    const { stripe, configured } = await stripeApi();
    const cents = Math.round(total * 100);
    if (!stripe || cents <= 0) {
      const paid = await markPaid(order, null);
      return {
        url: `${data.origin.replace(/\/$/, "")}/shop/success?order=${encodeURIComponent(paid.orderNumber)}`,
        orderNumber: paid.orderNumber,
        stripe: configured,
      };
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      success_url: `${data.origin.replace(/\/$/, "")}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin.replace(/\/$/, "")}/panier`,
      metadata: { orderId: String(order.id), orderNumber: order.orderNumber },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: cents,
            product_data: {
              name: `Commande OUTLAW #${order.orderNumber}`,
              description: lines
                .map((line) => `${line.title} × ${line.quantity}`)
                .join(", ")
                .slice(0, 400),
            },
          },
        },
      ],
    });

    await sql`
      update orders
      set stripe_session_id = ${session.id}, updated_at = now()
      where id = ${order.id}
    `;

    if (!session.url) throw new Error("Paiement Stripe indisponible");
    return { url: session.url, orderNumber: order.orderNumber, stripe: true };
  });

export const loadCheckoutSuccess = createServerFn({ method: "GET" })
  .validator(
    z.object({
      sessionId: z.string().optional(),
      orderNumber: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    if (data.sessionId) return fulfillBySessionId(data.sessionId);
    if (data.orderNumber) return fulfillByOrderNumber(data.orderNumber);
    throw new Error("Commande introuvable");
  });

export const listOrders = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const rows = await sql<OrderRow>`
      select id, order_number, first_name, last_name, email, items_json, total,
             status, stripe_session_id, created_at
      from orders
      where status in ('pickup', 'delivered')
      order by created_at desc, id desc
    `;
    return rows.map(mapOrder);
  });

async function updatePickupStatus(id: number, status: "pickup" | "delivered") {
  const sql = await getSql();
  const rows = await sql<OrderRow>`
    update orders
    set status = ${status}, updated_at = now()
    where id = ${id} and status in ('pickup', 'delivered')
    returning id, order_number, first_name, last_name, email, items_json, total,
              status, stripe_session_id, created_at
  `;
  const row = rows[0];
  if (!row) throw new Error("Commande introuvable");
  return mapOrder(row);
}

export const setOrderStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      id: z.number(),
      status: z.enum(["pickup", "delivered"]),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    return updatePickupStatus(data.id, data.status);
  });

export const markOrderDelivered = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), id: z.number() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    return updatePickupStatus(data.id, "delivered");
  });
