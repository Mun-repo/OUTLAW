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
};

export type OrderEmailItem = {
  title: string;
  quantity: number;
  price: number;
};

export type OrderEmailPayload = {
  firstName: string;
  orderNumber: string;
  items: OrderEmailItem[];
  total: string;
};

function shell(title: string, inner: string) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:#000000;color:#ffffff;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#000000;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#000000;border:1px solid #27272a;">
          <tr>
            <td style="padding:40px 36px 24px;text-align:center;border-bottom:1px solid #27272a;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:34px;font-weight:800;letter-spacing:-0.04em;color:#ffffff;">outlaw.</p>
              <p style="margin:14px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">Association Outlaw</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              ${inner}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 36px 32px;text-align:center;border-top:1px solid #27272a;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.04em;color:#a1a1aa;">Ceux qui tracent leur propre route.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function eventDetails(title: string, when: string, location: string) {
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #27272a;">
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">Événement</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;">${escapeHtml(title)}</p>
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">Date & heure</p>
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;letter-spacing:0.06em;color:#ffffff;">${escapeHtml(when)}</p>
          <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">Lieu</p>
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">${escapeHtml(location || "Communiqué aux inscrits")}</p>
        </td>
      </tr>
    </table>
  `;
}

export function confirmationEmailHtml(data: ConfirmationPayload) {
  const inner = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#a1a1aa;">OUTLAW</p>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;">
      Confirmation de ton inscription
    </p>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#a1a1aa;">
      ${escapeHtml(data.firstName)}, ta place pour <strong style="color:#ffffff;">${escapeHtml(data.eventTitle)}</strong> est réservée.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#ffffff;">
      Présente cet e-mail ou donne ton nom à l'entrée.
    </p>
    <p style="margin:18px 0 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;letter-spacing:0.16em;color:#a1a1aa;">
      ${escapeHtml(data.ticketCode)}
    </p>
  `;
  return shell("Confirmation de ton inscription - OUTLAW", inner);
}

export function reminderEmailHtml(data: ReminderPayload) {
  const inner = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#a1a1aa;">Rappel</p>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;">
      Ton événement OUTLAW, c'est demain.
    </p>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#a1a1aa;">
      ${escapeHtml(data.firstName)}, on t'attend à <strong style="color:#ffffff;">${escapeHtml(data.eventTitle)}</strong>.
    </p>
    ${eventDetails(data.eventTitle, data.when, data.location)}
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#ffffff;">
      Présente cet e-mail ou donne ton nom à l'entrée.
    </p>
  `;
  return shell("[Rappel] Ton événement OUTLAW c'est demain !", inner);
}

export function massEmailHtml(data: MassPayload) {
  const inner = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#a1a1aa;">${escapeHtml(data.eventTitle)}</p>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;line-height:1.2;letter-spacing:-0.03em;color:#ffffff;">
      ${escapeHtml(data.subject)}
    </p>
    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.75;color:#d4d4d8;white-space:pre-wrap;">${escapeHtml(data.message)}</p>
  `;
  return shell(data.subject, inner);
}

export function orderConfirmationEmailHtml(data: OrderEmailPayload) {
  const lines = data.items
    .map((item) => {
      const lineTotal = item.price * item.quantity;
      return `
      <tr>
        <td style="padding:8px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">
          ${escapeHtml(item.title)} × ${item.quantity}
        </td>
        <td style="padding:8px 0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#ffffff;">
          ${escapeHtml(lineTotal.toFixed(2).replace(".", ","))} €
        </td>
      </tr>`;
    })
    .join("");
  const inner = `
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#a1a1aa;">Boutique</p>
    <p style="margin:0 0 24px;font-family:Arial,Helvetica,sans-serif;font-size:26px;font-weight:800;line-height:1.15;letter-spacing:-0.03em;color:#ffffff;">
      Ta commande OUTLAW est confirmée !
    </p>
    <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">
      ${escapeHtml(data.firstName)}, ton numéro
    </p>
    <p style="margin:0 0 28px;font-family:Arial,Helvetica,sans-serif;font-size:42px;font-weight:800;letter-spacing:-0.04em;line-height:1;color:#ffffff;">
      #${escapeHtml(data.orderNumber.replace(/^#/, ""))}
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #27272a;">
      <tr>
        <td style="padding:24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${lines}
            <tr>
              <td style="padding-top:16px;border-top:1px solid #27272a;font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#a1a1aa;">Total payé</td>
              <td style="padding-top:16px;border-top:1px solid #27272a;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#ffffff;">${escapeHtml(data.total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:28px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.65;color:#ffffff;">
      Remise en main propre à l'université. Présente ce numéro de commande ou cet e-mail pour récupérer tes articles.
    </p>
  `;
  return shell("Ta commande OUTLAW est confirmée !", inner);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&" + "amp;")
    .replaceAll("<", "&" + "lt;")
    .replaceAll(">", "&" + "gt;")
    .replaceAll('"', "&" + "quot;");
}
