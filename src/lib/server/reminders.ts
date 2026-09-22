import { getSql } from "@/lib/db";
import { asBool, eventOccursAt, formatEventWhen } from "@/lib/format";
import { reminderEmailHtml } from "@/lib/email/template";
import { resendConfigured, sendReminderEmail } from "@/lib/server/email";

const HOUR = 60 * 60 * 1000;
const WINDOW_END = 48 * HOUR;

type GuestRow = {
  id: number;
  email: string;
  first_name: string;
  ticket_code: string;
  event_id: number;
  title: string;
  event_date: unknown;
  event_time: unknown;
  location: string;
  ended: unknown;
};

function hoursUntil(eventDate: unknown, eventTime: unknown, now: number) {
  const at = eventOccursAt(eventDate, eventTime).getTime();
  if (Number.isNaN(at)) return null;
  return at - now;
}

export async function sendUpcomingReminders() {
  const sql = await getSql();
  const guests = await sql<GuestRow>`
    select r.id, r.email, r.first_name, r.ticket_code,
           e.id as event_id, e.title, e.event_date, e.event_time, e.location, e.ended
    from registrations r
    join events e on e.id = r.event_id
    where r.reminder_sent = false
      and e.ended = false
  `;

  const now = Date.now();
  const due = guests.filter((row) => {
    if (asBool(row.ended)) return false;
    const delta = hoursUntil(row.event_date, row.event_time, now);
    return delta != null && delta > 0 && delta < WINDOW_END;
  });

  const configured = resendConfigured();
  const results: {
    registrationId: number;
    eventId: number;
    email: string;
    delivered: boolean;
  }[] = [];
  let previewHtml: string | null = null;
  let delivered = 0;

  for (const row of due) {
    const delta = hoursUntil(row.event_date, row.event_time, now) ?? 0;
    const imminent = delta < 24 * HOUR;
    const when = formatEventWhen(row.event_date, row.event_time);
    const payload = {
      firstName: row.first_name,
      eventTitle: row.title,
      when,
      location: row.location,
      ticketCode: row.ticket_code,
      imminent,
    };
    if (!previewHtml) previewHtml = reminderEmailHtml(payload);

    let ok = false;
    if (configured) {
      const sent = await sendReminderEmail(row.email, payload);
      ok = sent.delivered;
      if (ok) delivered += 1;
      if (ok) {
        await sql`
          update registrations
          set reminder_sent = true
          where id = ${row.id}
        `;
      }
    }

    results.push({
      registrationId: row.id,
      eventId: row.event_id,
      email: row.email,
      delivered: ok,
    });
  }

  const eventIds = [
    ...new Set(
      results.filter((row) => row.delivered).map((row) => row.eventId),
    ),
  ];
  if (configured) {
    for (const eventId of eventIds) {
      await sql`
        update events
        set reminder_sent = true, updated_at = now()
        where id = ${eventId}
      `;
    }
  }

  return {
    ok: true,
    configured,
    scanned: guests.length,
    due: due.length,
    delivered: configured ? delivered : 0,
    events: results,
    previewHtml,
  };
}
