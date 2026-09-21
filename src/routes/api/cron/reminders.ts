import { createFileRoute } from "@tanstack/react-router";
import { env, isWorkspacePreview } from "@/lib/env.server";
import { sendUpcomingReminders } from "@/lib/server/reminders";

function cronAuthorized(request: Request) {
  const secret = env("CRON_SECRET");
  const header = request.headers.get("authorization") ?? "";
  if (secret) return header === `Bearer ${secret}`;
  return isWorkspacePreview();
}

async function handle(request: Request) {
  if (!cronAuthorized(request)) {
    return Response.json({ error: "Non autorisé" }, { status: 401 });
  }
  const result = await sendUpcomingReminders();
  return Response.json(result);
}

export const Route = createFileRoute("/api/cron/reminders")({
  server: {
    handlers: {
      GET: async ({ request }) => handle(request),
      POST: async ({ request }) => handle(request),
    },
  },
});
