import { Resend } from "resend";
import { env } from "@/lib/env.server";
import {
  confirmationEmailHtml,
  massEmailHtml,
  orderConfirmationEmailHtml,
  reminderEmailHtml,
  type ConfirmationPayload,
  type OrderEmailPayload,
  type ReminderPayload,
} from "@/lib/email/template";

const BATCH = 100;

export type SendResult = {
  delivered: boolean;
  html: string;
  error?: string;
};

function fromAddress() {
  return (
    env("FROM_EMAIL") ??
    env("RESEND_FROM") ??
    env("NEXT_PUBLIC_FROM_EMAIL") ??
    "Association Outlaw <onboarding@resend.dev>"
  );
}

function getClient() {
  const key = env("RESEND_API_KEY");
  if (!key) return null;
  return new Resend(key);
}

async function sendHtml(to: string, subject: string, html: string): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    return { delivered: false, html };
  }
  try {
    const result = await client.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error.message);
      return { delivered: false, html, error: result.error.message };
    }
    return { delivered: true, html };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Envoi impossible";
    console.error("[email] send failed:", message);
    return { delivered: false, html, error: message };
  }
}

export async function sendConfirmationEmail(
  to: string,
  payload: ConfirmationPayload,
) {
  return sendHtml(
    to,
    `Pass confirmé — ${payload.eventTitle}`,
    confirmationEmailHtml(payload),
  );
}

export async function sendReminderEmail(to: string, payload: ReminderPayload) {
  const subject = payload.imminent
    ? `C'est aujourd'hui : ${payload.eventTitle}`
    : `C'est demain : ${payload.eventTitle}`;
  return sendHtml(to, subject, reminderEmailHtml(payload));
}

export async function sendOrderConfirmationEmail(
  to: string,
  payload: OrderEmailPayload,
) {
  const number = payload.orderNumber.replace(/^#/, "");
  return sendHtml(
    to,
    `Commande #${number} confirmée — OUTLAW`,
    orderConfirmationEmailHtml(payload),
  );
}

export async function sendMassEmails(input: {
  recipients: { email: string; firstName: string }[];
  eventTitle: string;
  subject: string;
  message: string;
}) {
  const htmlFor = (firstName: string) =>
    massEmailHtml({
      firstName,
      eventTitle: input.eventTitle,
      subject: input.subject,
      message: input.message,
    });
  const previewHtml = htmlFor("vous");
  const client = getClient();
  if (!client) {
    return { delivered: 0, attempted: input.recipients.length, previewHtml };
  }

  let delivered = 0;
  for (let i = 0; i < input.recipients.length; i += BATCH) {
    const slice = input.recipients.slice(i, i + BATCH);
    try {
      const result = await client.batch.send(
        slice.map((r) => ({
          from: fromAddress(),
          to: r.email,
          subject: input.subject,
          html: htmlFor(r.firstName),
        })),
      );
      if (result.error) {
        console.error("[email] batch error:", result.error.message);
        continue;
      }
      delivered += slice.length;
    } catch (err) {
      console.error("[email] batch failed:", err);
    }
  }

  return {
    delivered,
    attempted: input.recipients.length,
    previewHtml,
  };
}

export function mailFromAddress() {
  return fromAddress();
}

export function resendConfigured() {
  return Boolean(env("RESEND_API_KEY"));
}
