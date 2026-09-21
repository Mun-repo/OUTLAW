import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ADMIN_SESSION_TOKEN = "otl-rita-v1";

export function assertAdminToken(token: string) {
  if (token !== ADMIN_SESSION_TOKEN) {
    throw new Error("Non autorisé");
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
    const identifier = data.identifier.trim();
    const password = data.password;
    if (identifier !== "rita.lou123" || password !== "outlaw.rita.mdp") {
      throw new Error("Identifiants incorrects");
    }
    return { token: ADMIN_SESSION_TOKEN };
  });
