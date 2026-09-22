import { createFileRoute } from "@tanstack/react-router";
import { cronAuthorized } from "@/lib/server/cron-auth";
import { sendUpcomingReminders } from "@/lib/server/reminders";

async function handle(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await sendUpcomingReminders();
  return Response.json(result);
}

export const Route = createFileRoute("/api/cron/event-reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
