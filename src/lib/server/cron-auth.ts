import { env, isWorkspacePreview } from "@/lib/env.server";

export function cronAuthorized(request: Request) {
  const secret = env("CRON_SECRET");
  if (!secret) return isWorkspacePreview();
  const header = request.headers.get("authorization") ?? "";
  const query = new URL(request.url).searchParams.get("secret");
  return header === `Bearer ${secret}` || query === secret;
}
