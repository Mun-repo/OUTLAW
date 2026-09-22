import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { asBool, asIso, formatEventWhen, isEventPast } from "@/lib/format";
import { assertAdminToken } from "@/lib/server/admin";
import { sendConfirmationEmail, sendMassEmails } from "@/lib/server/email";
import type { Registration } from "@/lib/types";

type RegistrationRow = {
  id: number;
  event_id: number;
  event_title: string;
  last_name: string;
  first_name: string;
  email: string;
  ticket_code: string;
  created_at: unknown;
};

function mapRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    eventId: row.event_id,
    eventTitle: row.event_title,
    lastName: row.last_name,
    firstName: row.first_name,
    email: row.email,
    ticketCode: row.ticket_code,
    createdAt: asIso(row.created_at),
  };
}

function ticketCode(id: number) {
  return `OTL-${String(id).padStart(5, "0")}`;
}

export const registerForEvent = createServerFn({ method: "POST" })
  .validator(
    z.object({
      eventId: z.number(),
      firstName: z.string().trim().min(1, "Le prénom est requis"),
      lastName: z.string().trim().min(1, "Le nom est requis"),
      email: z.string().trim().email("E-mail invalide"),
    }),
  )
  .handler(async ({ data }) => {
    const sql = await getSql();
    const events = await sql<{
      id: number;
      title: string;
      event_date: unknown;
      event_time: unknown;
      location: string;
      ended: unknown;
    }>`
      select id, title, event_date, event_time, location, ended
      from events
      where id = ${data.eventId}
    `;
    const event = events[0];
    if (!event) throw new Error("Événement introuvable");
    if (asBool(event.ended) || isEventPast(event.event_date, event.event_time)) {
      throw new Error("Cet événement est terminé");
    }

    const existing = await sql<{ id: number }>`
      select id from registrations
      where event_id = ${data.eventId} and lower(email) = ${data.email.toLowerCase()}
    `;
    if (existing[0]) {
      throw new Error("Cette adresse est déjà inscrite à cet événement");
    }

    const inserted = await sql<{ id: number }>`
      insert into registrations (event_id, last_name, first_name, email, ticket_code)
      values (${data.eventId}, ${data.lastName}, ${data.firstName}, ${data.email}, ${"PENDING"})
      returning id
    `;
    const id = inserted[0]?.id;
    if (!id) throw new Error("Inscription impossible");
    const code = ticketCode(id);
    await sql`update registrations set ticket_code = ${code} where id = ${id}`;

    const when = formatEventWhen(event.event_date, event.event_time);
    let emailResult = {
      delivered: false,
      html: "",
    };
    try {
      emailResult = await sendConfirmationEmail(data.email, {
        firstName: data.firstName,
        lastName: data.lastName,
        eventTitle: event.title,
        when,
        location: event.location,
        ticketCode: code,
      });
    } catch (err) {
      console.error("[email] registration confirmation failed:", err);
    }

    return {
      registration: {
        id,
        eventId: event.id,
        eventTitle: event.title,
        lastName: data.lastName,
        firstName: data.firstName,
        email: data.email,
        ticketCode: code,
        createdAt: new Date().toISOString(),
      } satisfies Registration,
      when,
      location: event.location,
      emailHtml: emailResult.html,
      delivered: emailResult.delivered,
    };
  });

export const listRegistrations = createServerFn({ method: "POST" })
  .validator(z.object({ token: z.string(), eventId: z.number().optional() }))
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const rows = data.eventId
      ? await sql<RegistrationRow>`
          select r.id, r.event_id, e.title as event_title, r.last_name, r.first_name,
                 r.email, r.ticket_code, r.created_at
          from registrations r
          join events e on e.id = r.event_id
          where r.event_id = ${data.eventId}
          order by r.created_at desc
        `
      : await sql<RegistrationRow>`
          select r.id, r.event_id, e.title as event_title, r.last_name, r.first_name,
                 r.email, r.ticket_code, r.created_at
          from registrations r
          join events e on e.id = r.event_id
          order by r.created_at desc
        `;
    return rows.map(mapRegistration);
  });

export const sendMassEmail = createServerFn({ method: "POST" })
  .validator(
    z.object({
      token: z.string(),
      eventId: z.number(),
      subject: z.string().trim().min(1),
      message: z.string().trim().min(1),
    }),
  )
  .handler(async ({ data }) => {
    assertAdminToken(data.token);
    const sql = await getSql();
    const events = await sql<{ title: string }>`
      select title from events where id = ${data.eventId}
    `;
    const event = events[0];
    if (!event) throw new Error("Événement introuvable");

    const guests = await sql<{ email: string; first_name: string }>`
      select email, first_name from registrations where event_id = ${data.eventId}
    `;
    if (guests.length === 0) {
      throw new Error("Aucun inscrit pour cet événement");
    }

    return sendMassEmails({
      recipients: guests.map((g) => ({
        email: g.email,
        firstName: g.first_name,
      })),
      eventTitle: event.title,
      subject: data.subject,
      message: data.message,
    });
  });
