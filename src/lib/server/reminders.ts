import { getSql } from "@/lib/db";
import { asBool, eventOccursAt, formatEventWhen } from "@/lib/format";
import { reminderEmailHtml } from "@/lib/email/template";
import { resendConfigured, sendReminderEmail } from "@/lib/server/email";

const HOUR = 60 * 60 * 1000;
const WINDOW_START = 24 * HOUR;
const WINDOW_END = 48 * HOUR;

type EventRow = {
  id: number;
  title: string;
  event_date: unknown;
  event_time: unknown;
  location: string;
  reminder_sent: unknown;
  ended: unknown;
};

type GuestRow = {
  email: string;
  first_name: string;
};

function inReminderWindow(eventDate: unknown, eventTime: unknown, now: number) {
  const at = eventOccursAt(eventDate, eventTime).getTime();
  if (Number.isNaN(at)) return false;
  const delta = at - now;
  return delta >= WINDOW_START && delta < WINDOW_END;
}

export async function sendUpcomingReminders() {
  const sql = await getSql();
  const events = await sql<EventRow>`
    select id, title, event_date, event_time, location, reminder_sent, ended
    from events
    where reminder_sent = false
      and ended = false
  `;
  const now = Date.now();
  const due = events.filter(
    (event) =>
      !asBool(event.ended) &&
      !asBool(event.reminder_sent) &&
      inReminderWindow(event.event_date, event.event_time, now),
  );

  const configured = resendConfigured();
  const results: {
    eventId: number;
    title: string;
    guests: number;
    delivered: number;
    marked: boolean;
  }[] = [];
  let previewHtml: string | null = null;

  for (const event of due) {
    const guests = await sql<GuestRow>`
      select email, first_name from registrations where event_id = ${event.id}
    `;
    const when = formatEventWhen(event.event_date, event.event_time);
    if (!previewHtml && guests[0]) {
      previewHtml = reminderEmailHtml({
        firstName: guests[0].first_name,
        eventTitle: event.title,
        when,
        location: event.location,
      });
    }

    let delivered = 0;
    if (configured) {
      for (const guest of guests) {
        const sent = await sendReminderEmail(guest.email, {
          firstName: guest.first_name,
          eventTitle: event.title,
          when,
          location: event.location,
        });
        if (sent.delivered) delivered += 1;
      }
    }

    const marked = configured ? delivered === guests.length || guests.length === 0 : false;
    if (configured) {
      await sql`
        update events
        set reminder_sent = true, updated_at = now()
        where id = ${event.id}
      `;
    }

    results.push({
      eventId: event.id,
      title: event.title,
      guests: guests.length,
      delivered: configured ? delivered : 0,
      marked: configured,
    });
  }

  return {
    ok: true,
    configured,
    scanned: events.length,
    due: due.length,
    events: results,
    previewHtml,
  };
}
