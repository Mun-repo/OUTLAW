import { env, isWorkspacePreview } from "@/lib/env.server";

export function cronAuthorized(request: Request) {
  const ua = (request.headers.get("user-agent") ?? "").toLowerCase();
  if (ua.includes("vercel-cron")) return true;

  const secret = env("CRON_SECRET");
  const header = request.headers.get("authorization") ?? "";
  if (secret && header === `Bearer ${secret}`) return true;

  const query = new URL(request.url).searchParams.get("secret");
  if (secret && query === secret) return true;

  if (!secret) return isWorkspacePreview();
  return false;
}
