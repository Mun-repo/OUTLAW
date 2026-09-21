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

async function sendHtml(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    return { delivered: false, html };
  }
  const result = await client.emails.send({
    from: fromAddress(),
    to,
    subject,
    html,
  });
  if (result.error) {
    return { delivered: false, html, error: result.error.message };
  }
  return { delivered: true, html };
}

export async function sendConfirmationEmail(
  to: string,
  payload: ConfirmationPayload,
) {
  return sendHtml(
    to,
    "Confirmation de ton inscription - OUTLAW",
    confirmationEmailHtml(payload),
  );
}

export async function sendReminderEmail(to: string, payload: ReminderPayload) {
  return sendHtml(
    to,
    "[Rappel] Ton événement OUTLAW c'est demain !",
    reminderEmailHtml(payload),
  );
}

export async function sendOrderConfirmationEmail(
  to: string,
  payload: OrderEmailPayload,
) {
  return sendHtml(
    to,
    "Ta commande OUTLAW est confirmée !",
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
    const result = await client.batch.send(
      slice.map((r) => ({
        from: fromAddress(),
        to: r.email,
        subject: input.subject,
        html: htmlFor(r.firstName),
      })),
    );
    if (result.error) {
      throw new Error(result.error.message);
    }
    delivered += slice.length;
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
