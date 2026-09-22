import { getSql } from "@/lib/db";
import { asBool, eventOccursAt, formatEventWhen } from "@/lib/format";
import { reminderEmailHtml } from "@/lib/email/template";
import { resendConfigured, sendReminderEmail } from "@/lib/server/email";

const HOUR = 60 * 60 * 1000;
const WINDOW_START = 24 * HOUR;
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
  event_reminder_sent: unknown;
};

function deltaMs(eventDate: unknown, eventTime: unknown, now: number) {
  const at = eventOccursAt(eventDate, eventTime).getTime();
  if (Number.isNaN(at)) return null;
  return at - now;
}

function inReminderWindow(delta: number | null) {
  return delta != null && delta >= WINDOW_START && delta < WINDOW_END;
}

export async function sendUpcomingReminders() {
  const sql = await getSql();
  const guests = await sql<GuestRow>`
    select r.id, r.email, r.first_name, r.ticket_code,
           e.id as event_id, e.title, e.event_date, e.event_time, e.location,
           e.ended, e.reminder_sent as event_reminder_sent
    from registrations r
    join events e on e.id = r.event_id
    where r.reminder_sent = false
      and e.ended = false
  `;

  const now = Date.now();
  const due = guests.filter((row) => {
    if (asBool(row.ended)) return false;
    return inReminderWindow(deltaMs(row.event_date, row.event_time, now));
  });

  const configured = resendConfigured();
  console.log("[cron/event-reminders] start", {
    at: new Date(now).toISOString(),
    configured,
    scanned: guests.length,
    due: due.length,
    windowHours: "24-48",
  });

  const results: {
    registrationId: number;
    eventId: number;
    title: string;
    email: string;
    hoursUntil: number;
    delivered: boolean;
    error?: string;
  }[] = [];
  let previewHtml: string | null = null;
  let delivered = 0;
  let failed = 0;

  for (const row of due) {
    const delta = deltaMs(row.event_date, row.event_time, now) ?? 0;
    const hoursUntil = Math.round((delta / HOUR) * 10) / 10;
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
    let error: string | undefined;
    if (!configured) {
      error = "RESEND_API_KEY manquante";
      console.warn("[cron/event-reminders] skip, Resend not configured", {
        email: row.email,
        eventId: row.event_id,
      });
    } else {
      const sent = await sendReminderEmail(row.email, payload);
      ok = sent.delivered;
      error = sent.error;
      if (ok) {
        delivered += 1;
        await sql`
          update registrations
          set reminder_sent = true
          where id = ${row.id}
        `;
        console.log("[cron/event-reminders] sent", {
          email: row.email,
          eventId: row.event_id,
          title: row.title,
          hoursUntil,
        });
      } else {
        failed += 1;
        console.error("[cron/event-reminders] send failed", {
          email: row.email,
          eventId: row.event_id,
          error,
        });
      }
    }

    results.push({
      registrationId: row.id,
      eventId: row.event_id,
      title: row.title,
      email: row.email,
      hoursUntil,
      delivered: ok,
      error,
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

  console.log("[cron/event-reminders] done", {
    scanned: guests.length,
    due: due.length,
    delivered,
    failed,
    configured,
  });

  return {
    ok: true,
    configured,
    scanned: guests.length,
    due: due.length,
    delivered: configured ? delivered : 0,
    failed,
    events: results,
    previewHtml,
  };
}
