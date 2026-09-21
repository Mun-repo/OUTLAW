import { createFileRoute } from "@tanstack/react-router";
import { assertAdminToken } from "@/lib/server/admin";
import { sendConfirmationEmail, sendMassEmails } from "@/lib/server/email";
import { getSql } from "@/lib/db";
import { formatEventWhen } from "@/lib/format";

export const Route = createFileRoute("/api/send-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as {
          type?: string;
          token?: string;
          to?: string;
          firstName?: string;
          lastName?: string;
          eventId?: number;
          subject?: string;
          message?: string;
          ticketCode?: string;
        };

        if (body.type === "mass") {
          if (!body.token) {
            return Response.json({ error: "Non autorisé" }, { status: 401 });
          }
          assertAdminToken(body.token);
          if (!body.eventId || !body.subject || !body.message) {
            return Response.json({ error: "Champs manquants" }, { status: 400 });
          }
          const sql = await getSql();
          const events = await sql<{ title: string }>`
            select title from events where id = ${body.eventId}
          `;
          const event = events[0];
          if (!event) {
            return Response.json({ error: "Événement introuvable" }, { status: 404 });
          }
          const guests = await sql<{ email: string; first_name: string }>`
            select email, first_name from registrations where event_id = ${body.eventId}
          `;
          const result = await sendMassEmails({
            recipients: guests.map((g) => ({
              email: g.email,
              firstName: g.first_name,
            })),
            eventTitle: event.title,
            subject: body.subject,
            message: body.message,
          });
          return Response.json(result);
        }

        if (!body.to || !body.firstName || !body.lastName || !body.eventId) {
          return Response.json({ error: "Champs manquants" }, { status: 400 });
        }
        const sql = await getSql();
        const guests = await sql<{ id: number; ticket_code: string }>`
          select id, ticket_code from registrations
          where event_id = ${body.eventId} and lower(email) = ${body.to.toLowerCase()}
        `;
        if (!guests[0]) {
          return Response.json({ error: "Inscription introuvable" }, { status: 404 });
        }
        const events = await sql<{
          title: string;
          event_date: string;
          event_time: string;
          location: string;
        }>`
          select title, event_date, event_time, location from events where id = ${body.eventId}
        `;
        const event = events[0];
        if (!event) {
          return Response.json({ error: "Événement introuvable" }, { status: 404 });
        }
        const result = await sendConfirmationEmail(body.to, {
          firstName: body.firstName,
          lastName: body.lastName,
          eventTitle: event.title,
          when: formatEventWhen(event.event_date, event.event_time),
          location: event.location,
          ticketCode: body.ticketCode || guests[0].ticket_code,
        });
        return Response.json(result);
      },
    },
  },
});
