import { createFileRoute } from "@tanstack/react-router";
import { cronAuthorized } from "@/lib/server/cron-auth";
import { sendUpcomingReminders } from "@/lib/server/reminders";

async function handle(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!cronAuthorized(request)) {
    console.warn("[cron/event-reminders] unauthorized", { ua });
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  console.log("[cron/event-reminders] authorized", { method: request.method, ua });
  try {
    const result = await sendUpcomingReminders();
    console.log("[cron/event-reminders] participants notified", result.delivered);
    return Response.json(result);
  } catch (err) {
    console.error("[cron/event-reminders] failed", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Rappel impossible" },
      { status: 500 },
    );
  }
}

export const Route = createFileRoute("/api/cron/event-reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
