export type ConfirmationPayload = {
  firstName: string;
  lastName: string;
  eventTitle: string;
  when: string;
  location: string;
  ticketCode: string;
};

export type MassPayload = {
  firstName: string;
  eventTitle: string;
  subject: string;
  message: string;
};

export type ReminderPayload = {
  firstName: string;
  eventTitle: string;
  when: string;
  location: string;
  ticketCode?: string;
  imminent?: boolean;
};

export type OrderEmailItem = {
  title: string;
  quantity: number;
  price: number;
};

export type OrderEmailPayload = {
  firstName: string;
  lastName?: string;
  orderNumber: string;
  items: OrderEmailItem[];
  total: string;
  pickupNote?: string;
};

const FONT = "Georgia, 'Times New Roman', Times, serif";
const BODY = "Arial, Helvetica, sans-serif";
const BONE = "#f4f0e6";
const MUTED = "#a1a1aa";
const LINE = "#2a2a2a";
const CARD = "#111111";
const SITE = "https://outlawfld.fr";
const CONTACT = "contact@outlawfld.fr";

function preheader(text: string) {
  return `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(text)}</div>`;
}

function legalFooter(kind: "order" | "event" | "notice") {
  const reason =
    kind === "order"
      ? "Vous recevez cet e-mail suite à votre commande sur outlawfld.fr."
      : kind === "event"
        ? "Vous recevez cet e-mail suite à votre inscription à un événement sur outlawfld.fr."
        : "Vous recevez cet e-mail de la part d'OUTLAW — outlawfld.fr.";
  return `
    <p style="margin:0 0 8px;font-family:${BODY};font-size:11px;line-height:1.6;color:${MUTED};">
      ${reason}
    </p>
    <p style="margin:0 0 8px;font-family:${BODY};font-size:11px;line-height:1.6;color:${MUTED};">
      OUTLAW — outlawfld.fr<br />
      Association Outlaw, loi 1901
    </p>
    <p style="margin:0;font-family:${BODY};font-size:11px;line-height:1.6;color:${MUTED};">
      Une question ? Écrivez-nous à <a href="mailto:${CONTACT}" style="color:${BONE};text-decoration:underline;">${CONTACT}</a>
      · <a href="${SITE}" style="color:${BONE};text-decoration:underline;">outlawfld.fr</a>
    </p>
  `;
}

function shell(title: string, preview: string, inner: string, kind: "order" | "event" | "notice") {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:${BONE};">
  ${preheader(preview)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#000000;border:1px solid ${LINE};">
          <tr>
            <td style="padding:32px 32px 20px;border-bottom:1px solid ${LINE};">
              <p style="margin:0;font-family:${FONT};font-size:28px;font-weight:700;letter-spacing:-0.03em;color:${BONE};">outlaw.</p>
              <p style="margin:8px 0 0;font-family:${BODY};font-size:12px;color:${MUTED};">Collectif culturel indépendant</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid ${LINE};">
              ${legalFooter(kind)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function label(text: string) {
  return `<p style="margin:0 0 6px;font-family:${BODY};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${escapeHtml(text)}</p>`;
}

function eventDetails(title: string, when: string, location: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:20px 22px;">
          ${label("Événement")}
          <p style="margin:0 0 16px;font-family:${FONT};font-size:20px;font-weight:700;color:${BONE};">${escapeHtml(title)}</p>
          ${label("Date et heure")}
          <p style="margin:0 0 16px;font-family:${BODY};font-size:14px;color:${BONE};">${escapeHtml(when)}</p>
          ${label("Lieu")}
          <p style="margin:0;font-family:${BODY};font-size:14px;color:${BONE};">${escapeHtml(location || "Communiqué aux inscrits")}</p>
        </td>
      </tr>
    </table>
  `;
}

function passCard(code: string, name?: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border:1px solid ${BONE};">
      <tr>
        <td style="padding:20px 22px;text-align:center;">
          <p style="margin:0;font-family:${BODY};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};">Code d'accès</p>
          <p style="margin:10px 0 0;font-family:${BODY};font-size:22px;font-weight:700;letter-spacing:0.08em;color:${BONE};">${escapeHtml(code)}</p>
          ${name ? `<p style="margin:8px 0 0;font-family:${BODY};font-size:13px;color:${MUTED};">${escapeHtml(name)}</p>` : ""}
        </td>
      </tr>
    </table>
  `;
}

function dayNotes() {
  return `
    <p style="margin:24px 0 0;font-family:${BODY};font-size:14px;line-height:1.7;color:${BONE};">
      Merci d'arriver un peu en avance. Présente ce code ou donne ton nom à l'entrée.
      L'accès est nominatif : conserve cet e-mail jusqu'à l'événement.
    </p>
  `;
}

export function confirmationEmailHtml(data: ConfirmationPayload) {
  const name = `${data.firstName} ${data.lastName}`.trim();
  const inner = `
    <p style="margin:0 0 18px;font-family:${FONT};font-size:24px;font-weight:700;line-height:1.25;color:${BONE};">
      Confirmation d'inscription
    </p>
    <p style="margin:0 0 24px;font-family:${BODY};font-size:15px;line-height:1.7;color:${MUTED};">
      Bonjour ${escapeHtml(data.firstName)}, ton inscription à
      <strong style="color:${BONE};">${escapeHtml(data.eventTitle)}</strong> est enregistrée.
      Voici les informations à retenir pour le jour de l'événement.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    ${passCard(data.ticketCode, name)}
    ${dayNotes()}
  `;
  return shell(
    `Confirmation d'inscription — ${data.eventTitle}`,
    `Inscription confirmée pour ${data.eventTitle}. Code d'accès ${data.ticketCode}.`,
    inner,
    "event",
  );
}

export function confirmationEmailText(data: ConfirmationPayload) {
  const name = `${data.firstName} ${data.lastName}`.trim();
  return [
    "OUTLAW",
    "",
    `Bonjour ${data.firstName},`,
    "",
    `Ton inscription à ${data.eventTitle} est enregistrée.`,
    "",
    `Événement : ${data.eventTitle}`,
    `Date et heure : ${data.when}`,
    `Lieu : ${data.location || "Communiqué aux inscrits"}`,
    `Code d'accès : ${data.ticketCode}`,
    name ? `Au nom de : ${name}` : "",
    "",
    "Merci d'arriver un peu en avance. Présente ce code ou donne ton nom à l'entrée.",
    "L'accès est nominatif : conserve cet e-mail jusqu'à l'événement.",
    "",
    "Vous recevez cet e-mail suite à votre inscription à un événement sur outlawfld.fr.",
    "OUTLAW — outlawfld.fr",
    "Association Outlaw, loi 1901",
    `Contact : ${CONTACT}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function reminderEmailHtml(data: ReminderPayload) {
  const headline = data.imminent
    ? `${data.eventTitle} a lieu aujourd'hui`
    : `${data.eventTitle} a lieu demain`;
  const inner = `
    <p style="margin:0 0 18px;font-family:${FONT};font-size:24px;font-weight:700;line-height:1.25;color:${BONE};">
      ${escapeHtml(headline)}
    </p>
    <p style="margin:0 0 24px;font-family:${BODY};font-size:15px;line-height:1.7;color:${MUTED};">
      Bonjour ${escapeHtml(data.firstName)}, petit rappel pour ton inscription.
      On t'attend sur place aux horaires indiqués ci-dessous.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    ${data.ticketCode ? passCard(data.ticketCode, data.firstName) : ""}
    ${dayNotes()}
  `;
  return shell(
    headline,
    `Rappel pour ${data.eventTitle} — ${data.when}.`,
    inner,
    "event",
  );
}

export function reminderEmailText(data: ReminderPayload) {
  const headline = data.imminent
    ? `${data.eventTitle} a lieu aujourd'hui`
    : `${data.eventTitle} a lieu demain`;
  return [
    "OUTLAW",
    "",
    `Bonjour ${data.firstName},`,
    "",
    headline + ".",
    "",
    `Événement : ${data.eventTitle}`,
    `Date et heure : ${data.when}`,
    `Lieu : ${data.location || "Communiqué aux inscrits"}`,
    data.ticketCode ? `Code d'accès : ${data.ticketCode}` : "",
    "",
    "Merci d'arriver un peu en avance. Présente ce code ou donne ton nom à l'entrée.",
    "",
    "Vous recevez cet e-mail suite à votre inscription à un événement sur outlawfld.fr.",
    "OUTLAW — outlawfld.fr",
    "Association Outlaw, loi 1901",
    `Contact : ${CONTACT}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}

export function massEmailHtml(data: MassPayload) {
  const inner = `
    <p style="margin:0 0 8px;font-family:${BODY};font-size:12px;color:${MUTED};">${escapeHtml(data.eventTitle)}</p>
    <p style="margin:0 0 20px;font-family:${FONT};font-size:22px;font-weight:700;line-height:1.3;color:${BONE};">
      ${escapeHtml(data.subject)}
    </p>
    <p style="margin:0;font-family:${BODY};font-size:15px;line-height:1.75;color:${BONE};white-space:pre-wrap;">${escapeHtml(data.message)}</p>
  `;
  return shell(data.subject, data.subject, inner, "notice");
}

export function massEmailText(data: MassPayload) {
  return [
    "OUTLAW",
    data.eventTitle,
    "",
    `Bonjour ${data.firstName},`,
    "",
    data.subject,
    "",
    data.message,
    "",
    "Vous recevez cet e-mail de la part d'OUTLAW — outlawfld.fr.",
    "Association Outlaw, loi 1901",
    `Contact : ${CONTACT}`,
  ].join("\n");
}

export function orderConfirmationEmailHtml(data: OrderEmailPayload) {
  const lines = data.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `
      <tr>
        <td style="padding:10px 0;font-family:${BODY};font-size:14px;color:${BONE};border-bottom:1px solid ${LINE};">
          ${escapeHtml(item.title)}<br />
          <span style="font-size:12px;color:${MUTED};">Quantité : ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;text-align:right;font-family:${BODY};font-size:14px;color:${BONE};border-bottom:1px solid ${LINE};white-space:nowrap;">
          ${escapeHtml(formatMoney(lineTotal))}
        </td>
      </tr>`;
    })
    .join("");
  const number = data.orderNumber.replace(/^#/, "");
  const pickup =
    data.pickupNote ||
    "Retrait en main propre à l'université. Pas d'expédition.";
  const inner = `
    <p style="margin:0 0 18px;font-family:${FONT};font-size:24px;font-weight:700;line-height:1.25;color:${BONE};">
      Confirmation de commande
    </p>
    <p style="margin:0 0 24px;font-family:${BODY};font-size:15px;line-height:1.7;color:${MUTED};">
      Bonjour ${escapeHtml(data.firstName)}, nous avons bien reçu ton paiement.
      Voici le récapitulatif de ta commande. Conserve ce message pour le retrait.
    </p>
    ${label("Reference")}
    <p style="margin:0 0 24px;font-family:${BODY};font-size:28px;font-weight:700;color:${BONE};">
      ${escapeHtml(number)}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:20px 22px;">
          ${label("Articles")}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${lines}
            <tr>
              <td style="padding-top:14px;font-family:${BODY};font-size:12px;color:${MUTED};">Total</td>
              <td style="padding-top:14px;text-align:right;font-family:${BODY};font-size:16px;font-weight:700;color:${BONE};">${escapeHtml(data.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:20px 22px;">
          ${label("Retrait")}
          <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.65;color:${BONE};">${escapeHtml(pickup)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:24px 0 0;font-family:${BODY};font-size:14px;line-height:1.7;color:${MUTED};">
      Présente ce numéro de commande ou cet e-mail pour récupérer tes articles.
    </p>
  `;
  return shell(
    `Confirmation de commande ${number}`,
    `Commande ${number} confirmée. Total ${data.total}. Retrait en main propre.`,
    inner,
    "order",
  );
}

export function orderConfirmationEmailText(data: OrderEmailPayload) {
  const number = data.orderNumber.replace(/^#/, "");
  const pickup =
    data.pickupNote ||
    "Retrait en main propre à l'université. Pas d'expédition.";
  const items = data.items
    .map(
      (item) =>
        `- ${item.title} x ${item.quantity} : ${formatMoney(item.price * item.quantity)}`,
    )
    .join("\n");
  return [
    "OUTLAW",
    "",
    `Bonjour ${data.firstName},`,
    "",
    "Nous avons bien reçu ton paiement. Voici le récapitulatif de ta commande.",
    "",
    `Référence : ${number}`,
    "",
    "Articles :",
    items,
    "",
    `Total : ${data.total}`,
    "",
    `Retrait : ${pickup}`,
    "",
    "Présente ce numéro de commande ou cet e-mail pour récupérer tes articles.",
    "",
    "Vous recevez cet e-mail suite à votre commande sur outlawfld.fr.",
    "OUTLAW — outlawfld.fr",
    "Association Outlaw, loi 1901",
    `Contact : ${CONTACT}`,
  ].join("\n");
}

function formatMoney(value: number) {
  return `${value.toFixed(2).replace(".", ",")} EUR`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}
