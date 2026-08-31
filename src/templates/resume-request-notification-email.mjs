const EMPTY_VALUE = "No disponible";

function escapeHtml(value) {
  return String(value ?? EMPTY_VALUE).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character],
  );
}

function toText(value) {
  return String(value ?? EMPTY_VALUE);
}

export function createResumeRequestNotificationEmail(
  resumeRequest,
  { persistedAt = null } = {},
) {
  const email = escapeHtml(resumeRequest.email);
  const requestId = escapeHtml(resumeRequest.requestId);
  const requestedAt = escapeHtml(resumeRequest.requestedAt);
  const ipHash = escapeHtml(resumeRequest.ipHash);
  const persistenceTimestamp = persistedAt
    ? escapeHtml(persistedAt)
    : "Registro existente confirmado";
  const subscription = resumeRequest.subscribeToUpdates ? "Sí" : "No";

  const text = [
    "Nueva solicitud de descarga de CV",
    "",
    `${toText(resumeRequest.email)} solicitó descargar tu CV.`,
    "La información de la solicitud fue confirmada correctamente en DynamoDB.",
    "",
    `Correo: ${toText(resumeRequest.email)}`,
    `Fecha de solicitud: ${toText(resumeRequest.requestedAt)}`,
    `Guardado en DynamoDB: ${persistedAt ?? "Registro existente confirmado"}`,
    `Acepta actualizaciones: ${subscription}`,
    `Request ID: ${toText(resumeRequest.requestId)}`,
    `IP hash: ${toText(resumeRequest.ipHash)}`,
    "",
    "Notificación automática de portfolio-resume-requests-consumer.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>Nueva solicitud de descarga de CV</title>
    <style>
      @media only screen and (max-width: 620px) {
        .email-shell { width: 100% !important; }
        .content-padding { padding-left: 22px !important; padding-right: 22px !important; }
        .headline { font-size: 30px !important; line-height: 36px !important; }
        .detail-label, .detail-value { display: block !important; width: 100% !important; }
        .detail-value { padding-top: 6px !important; text-align: left !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#020617; color:#f1f5f9;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${email} solicitó descargar tu CV y su registro fue confirmado en DynamoDB.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#020617;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:600px; max-width:600px; background-color:#0b1220; border:1px solid #1e293b; border-radius:16px; overflow:hidden;">
            <tr>
              <td height="4" style="height:4px; background-color:#10b981; background-image:linear-gradient(90deg,#10b981 0%,#06b6d4 100%); font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:30px 38px 18px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td valign="middle">
                      <span style="display:inline-block; width:32px; height:32px; line-height:32px; text-align:center; border-radius:9px; background-color:#10b981; color:#020617; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:13px; font-weight:800;">JB</span>
                      <span style="padding-left:10px; color:#cbd5e1; font-size:13px; font-weight:700; letter-spacing:0.04em;">PORTFOLIO SYSTEM</span>
                    </td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block; padding:7px 11px; border:1px solid #14532d; border-radius:999px; background-color:#052e2b; color:#34d399; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">Procesada</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:18px 38px 12px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <p style="margin:0 0 12px; color:#34d399; font-size:12px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Nueva actividad</p>
                <h1 class="headline" style="margin:0; color:#ffffff; font-size:38px; line-height:44px; letter-spacing:-0.035em; font-weight:750;">Alguien quiere descargar tu CV.</h1>
                <p style="margin:18px 0 0; color:#94a3b8; font-size:16px; line-height:26px;">El visitante <strong style="color:#f1f5f9; font-weight:650;">${email}</strong> realizó una solicitud. La información de auditoría quedó guardada correctamente antes de enviar esta notificación.</p>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:20px 38px 8px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#071a19; border:1px solid #14532d; border-radius:12px;">
                  <tr>
                    <td width="46" valign="top" style="padding:18px 0 18px 18px; color:#34d399; font-size:24px; line-height:24px;">✓</td>
                    <td style="padding:17px 18px 17px 8px;">
                      <p style="margin:0 0 4px; color:#d1fae5; font-size:14px; line-height:20px; font-weight:750;">Persistencia confirmada</p>
                      <p style="margin:0; color:#6ee7b7; font-size:13px; line-height:20px;">El registro está disponible en la tabla de DynamoDB.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:18px 38px 8px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:separate; background-color:#0f172a; border:1px solid #1e293b; border-radius:12px;">
                  <tr>
                    <td colspan="2" style="padding:18px 20px 13px; border-bottom:1px solid #1e293b; color:#f1f5f9; font-size:14px; font-weight:750;">Detalle de la solicitud</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" style="padding:15px 20px 8px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Correo</td>
                    <td class="detail-value" style="padding:15px 20px 8px; color:#22d3ee; font-size:14px; text-align:right; word-break:break-word;">${email}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" style="padding:10px 20px 8px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Solicitado</td>
                    <td class="detail-value" style="padding:10px 20px 8px; color:#cbd5e1; font-size:14px; text-align:right;">${requestedAt}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" style="padding:10px 20px 8px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Persistido</td>
                    <td class="detail-value" style="padding:10px 20px 8px; color:#cbd5e1; font-size:14px; text-align:right;">${persistenceTimestamp}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" style="padding:10px 20px 8px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Actualizaciones</td>
                    <td class="detail-value" style="padding:10px 20px 8px; color:#cbd5e1; font-size:14px; text-align:right;">${subscription}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" valign="top" style="padding:10px 20px 8px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">Request ID</td>
                    <td class="detail-value" style="padding:10px 20px 8px; color:#94a3b8; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:12px; line-height:18px; text-align:right; word-break:break-all;">${requestId}</td>
                  </tr>
                  <tr>
                    <td class="detail-label" width="38%" valign="top" style="padding:10px 20px 18px; color:#64748b; font-size:12px; font-weight:700; letter-spacing:0.06em; text-transform:uppercase;">IP hash</td>
                    <td class="detail-value" style="padding:10px 20px 18px; color:#94a3b8; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:12px; line-height:18px; text-align:right; word-break:break-all;">${ipHash}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:18px 38px 30px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="center" style="padding:10px 0 18px; color:#64748b; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:11px; line-height:18px;">SQS&nbsp;&nbsp;→&nbsp;&nbsp;Lambda&nbsp;&nbsp;→&nbsp;&nbsp;<span style="color:#34d399;">DynamoDB ✓</span>&nbsp;&nbsp;→&nbsp;&nbsp;Gmail SMTP</td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-top:18px; border-top:1px solid #1e293b; color:#475569; font-size:11px; line-height:18px;">Notificación automática de portfolio-resume-requests-consumer.<br>No es necesario responder este correo.</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return Object.freeze({ text, html });
}
