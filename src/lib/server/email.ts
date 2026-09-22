import { Resend } from "resend";
import { env } from "@/lib/env.server";
import {
  confirmationEmailHtml,
  confirmationEmailText,
  massEmailHtml,
  massEmailText,
  orderConfirmationEmailHtml,
  orderConfirmationEmailText,
  reminderEmailHtml,
  reminderEmailText,
  type ConfirmationPayload,
  type OrderEmailPayload,
  type ReminderPayload,
} from "@/lib/email/template";

const BATCH = 100;
const REPLY_TO = "contact@outlawfld.fr";
const UNSUBSCRIBE = "<mailto:contact@outlawfld.fr?subject=desinscription>";

export type SendResult = {
  delivered: boolean;
  html: string;
  error?: string;
};

function fromAddress() {
  return (
    env("RESEND_FROM") ||
    env("FROM_EMAIL") ||
    "OUTLAW <contact@outlawfld.fr>"
  );
}

function getClient() {
  const key = env("RESEND_API_KEY");
  if (!key) return null;
  return new Resend(key);
}

function mailHeaders() {
  return {
    "List-Unsubscribe": UNSUBSCRIBE,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

async function sendMail(input: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const client = getClient();
  if (!client) {
    return { delivered: false, html: input.html };
  }
  try {
    const result = await client.emails.send({
      from: fromAddress(),
      to: input.to,
      replyTo: REPLY_TO,
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: mailHeaders(),
    });
    if (result.error) {
      console.error("[email] Resend error:", result.error.message);
      return { delivered: false, html: input.html, error: result.error.message };
    }
    return { delivered: true, html: input.html };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Envoi impossible";
    console.error("[email] send failed:", message);
    return { delivered: false, html: input.html, error: message };
  }
}

export async function sendConfirmationEmail(
  to: string,
  payload: ConfirmationPayload,
) {
  return sendMail({
    to,
    subject: `Confirmation d'inscription — ${payload.eventTitle}`,
    html: confirmationEmailHtml(payload),
    text: confirmationEmailText(payload),
  });
}

export async function sendReminderEmail(to: string, payload: ReminderPayload) {
  const subject = payload.imminent
    ? `Rappel : ${payload.eventTitle} a lieu aujourd'hui`
    : `Rappel : ${payload.eventTitle} a lieu demain`;
  return sendMail({
    to,
    subject,
    html: reminderEmailHtml(payload),
    text: reminderEmailText(payload),
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  payload: OrderEmailPayload,
) {
  const number = payload.orderNumber.replace(/^#/, "");
  return sendMail({
    to,
    subject: `Confirmation de commande ${number}`,
    html: orderConfirmationEmailHtml(payload),
    text: orderConfirmationEmailText(payload),
  });
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
  const textFor = (firstName: string) =>
    massEmailText({
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
          replyTo: REPLY_TO,
          subject: input.subject,
          html: htmlFor(r.firstName),
          text: textFor(r.firstName),
          headers: mailHeaders(),
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
