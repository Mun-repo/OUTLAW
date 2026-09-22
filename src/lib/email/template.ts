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

const FONT =
  "Syne, Arial, Helvetica, sans-serif";
const BODY =
  "Space Grotesk, Arial, Helvetica, sans-serif";
const BONE = "#f4f0e6";
const MUTED = "#a1a1aa";
const LINE = "#27272a";
const CARD = "#0a0a0a";

function shell(title: string, kicker: string, inner: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:${BONE};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#000000;border:1px solid ${LINE};">
          <tr>
            <td style="padding:36px 36px 22px;text-align:center;border-bottom:1px solid ${LINE};">
              <p style="margin:0;font-family:${FONT};font-size:32px;font-weight:800;letter-spacing:-0.05em;color:${BONE};">outlaw.</p>
              <p style="margin:12px 0 0;font-family:${BODY};font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:${MUTED};">${escapeHtml(kicker)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:22px 36px 30px;text-align:center;border-top:1px solid ${LINE};">
              <p style="margin:0;font-family:${FONT};font-size:12px;letter-spacing:0.04em;color:${MUTED};">Ceux qui tracent leur propre route.</p>
              <p style="margin:10px 0 0;font-family:${BODY};font-size:11px;color:${MUTED};">Association Outlaw · Loi 1901</p>
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
  return `<p style="margin:0 0 6px;font-family:${BODY};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${MUTED};">${escapeHtml(text)}</p>`;
}

function eventDetails(title: string, when: string, location: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:24px;">
          ${label("Événement")}
          <p style="margin:0 0 18px;font-family:${FONT};font-size:22px;font-weight:800;letter-spacing:-0.03em;color:${BONE};">${escapeHtml(title)}</p>
          ${label("Date & heure")}
          <p style="margin:0 0 18px;font-family:${BODY};font-size:14px;letter-spacing:0.04em;color:${BONE};">${escapeHtml(when)}</p>
          ${label("Lieu")}
          <p style="margin:0;font-family:${BODY};font-size:14px;color:${BONE};">${escapeHtml(location || "Communiqué aux inscrits")}</p>
        </td>
      </tr>
    </table>
  `;
}

function passCard(code: string, name?: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background:${BONE};">
      <tr>
        <td style="padding:22px 24px;text-align:center;">
          <p style="margin:0;font-family:${BODY};font-size:10px;letter-spacing:0.34em;text-transform:uppercase;color:#000000;">Pass d'accès</p>
          <p style="margin:12px 0 0;font-family:${FONT};font-size:28px;font-weight:800;letter-spacing:0.12em;color:#000000;">${escapeHtml(code)}</p>
          ${name ? `<p style="margin:10px 0 0;font-family:${BODY};font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#111111;">${escapeHtml(name)}</p>` : ""}
        </td>
      </tr>
    </table>
  `;
}

function dayNotes() {
  return `
    <p style="margin:28px 0 10px;font-family:${BODY};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${MUTED};">Le jour J</p>
    <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.7;color:${BONE};">
      Arrive un peu en avance. Présente ce pass ou donne ton nom à l'entrée.
      L'accès est nominatif — garde cet e-mail sous la main.
    </p>
  `;
}

export function confirmationEmailHtml(data: ConfirmationPayload) {
  const name = `${data.firstName} ${data.lastName}`.trim();
  const inner = `
    ${label("Inscription")}
    <p style="margin:0 0 20px;font-family:${FONT};font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:${BONE};">
      Ta place est confirmée.
    </p>
    <p style="margin:0 0 28px;font-family:${BODY};font-size:14px;line-height:1.65;color:${MUTED};">
      ${escapeHtml(data.firstName)}, tu es inscrit·e à <strong style="color:${BONE};">${escapeHtml(data.eventTitle)}</strong>.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    ${passCard(data.ticketCode, name)}
    ${dayNotes()}
  `;
  return shell(
    `Pass confirmé — ${data.eventTitle}`,
    "Confirmation d'inscription",
    inner,
  );
}

export function reminderEmailHtml(data: ReminderPayload) {
  const headline = data.imminent
    ? `C'est aujourd'hui : ${data.eventTitle}`
    : `C'est demain : ${data.eventTitle}`;
  const inner = `
    ${label("Rappel")}
    <p style="margin:0 0 20px;font-family:${FONT};font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:${BONE};">
      ${escapeHtml(headline)}
    </p>
    <p style="margin:0 0 28px;font-family:${BODY};font-size:14px;line-height:1.65;color:${MUTED};">
      ${escapeHtml(data.firstName)}, on t'attend.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    ${data.ticketCode ? passCard(data.ticketCode, data.firstName) : ""}
    ${dayNotes()}
  `;
  return shell(headline, "Rappel événement", inner);
}

export function massEmailHtml(data: MassPayload) {
  const inner = `
    ${label(data.eventTitle)}
    <p style="margin:0 0 24px;font-family:${FONT};font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.03em;color:${BONE};">
      ${escapeHtml(data.subject)}
    </p>
    <p style="margin:0;font-family:${BODY};font-size:15px;line-height:1.75;color:#d4d4d8;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
  `;
  return shell(data.subject, data.eventTitle, inner);
}

export function orderConfirmationEmailHtml(data: OrderEmailPayload) {
  const lines = data.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `
      <tr>
        <td style="padding:10px 0;font-family:${BODY};font-size:14px;color:${BONE};border-bottom:1px solid ${LINE};">
          ${escapeHtml(item.title)}<br />
          <span style="font-size:12px;color:${MUTED};">× ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;text-align:right;font-family:${BODY};font-size:14px;color:${BONE};border-bottom:1px solid ${LINE};white-space:nowrap;">
          ${escapeHtml(lineTotal.toFixed(2).replace(".", ","))} €
        </td>
      </tr>`;
    })
    .join("");
  const number = data.orderNumber.replace(/^#/, "");
  const pickup =
    data.pickupNote ||
    "Remise en main propre à l'université. Aucune livraison.";
  const inner = `
    ${label("Boutique")}
    <p style="margin:0 0 20px;font-family:${FONT};font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:${BONE};">
      Ta commande est confirmée.
    </p>
    <p style="margin:0 0 8px;font-family:${BODY};font-size:14px;line-height:1.65;color:${MUTED};">
      ${escapeHtml(data.firstName)}, merci. Voici le récapitulatif.
    </p>
    ${label("Référence")}
    <p style="margin:0 0 28px;font-family:${FONT};font-size:42px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:${BONE};">
      #${escapeHtml(number)}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:24px;">
          ${label("Articles")}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${lines}
            <tr>
              <td style="padding-top:16px;font-family:${BODY};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${MUTED};">Total payé</td>
              <td style="padding-top:16px;text-align:right;font-family:${FONT};font-size:18px;font-weight:800;color:${BONE};">${escapeHtml(data.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:${CARD};border:1px solid ${LINE};">
      <tr>
        <td style="padding:24px;">
          ${label("Retrait")}
          <p style="margin:0;font-family:${BODY};font-size:14px;line-height:1.65;color:${BONE};">${escapeHtml(pickup)}</p>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-family:${BODY};font-size:14px;line-height:1.65;color:${MUTED};">
      Présente ce numéro de commande ou cet e-mail pour récupérer tes articles.
    </p>
  `;
  return shell(`Commande #${number} confirmée — OUTLAW`, "Confirmation de commande", inner);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}
