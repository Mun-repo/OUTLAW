import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function safeEqual(a: string, b: string) {
  return timingSafeEqual(sha256(a), sha256(b));
}

function sessionKey() {
  const secret = env("ADMIN_SESSION_SECRET");
  if (secret) return secret;
  const password = env("ADMIN_PASSWORD");
  if (!password) throw new Error("Admin non configuré");
  return sha256(`outlaw-admin-session:${password}`).toString("hex");
}

function sign(expiresAt: string) {
  return createHmac("sha256", sessionKey()).update(expiresAt).digest("hex");
}

function issueToken() {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function assertAdminToken(token: string) {
  const [expiresAt, signature] = (token ?? "").split(".");
  if (!expiresAt || !signature || !/^\d+$/.test(expiresAt)) {
    throw new Error("Non autorisé");
  }
  if (!safeEqual(signature, sign(expiresAt))) {
    throw new Error("Non autorisé");
  }
  if (Number(expiresAt) < Date.now()) {
    throw new Error("Session expirée");
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator(
    z.object({
      identifier: z.string(),
      password: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const expectedIdentifier = env("ADMIN_IDENTIFIER");
    const expectedPassword = env("ADMIN_PASSWORD");
    if (!expectedIdentifier || !expectedPassword) {
      throw new Error("Admin non configuré");
    }
    const identifierOk = safeEqual(data.identifier.trim(), expectedIdentifier);
    const passwordOk = safeEqual(data.password, expectedPassword);
    if (!identifierOk || !passwordOk) {
      throw new Error("Identifiants incorrects");
    }
    return { token: issueToken() };
  });
