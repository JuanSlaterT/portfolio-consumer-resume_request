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
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Nueva solicitud de descarga de CV</title>
    <style>
      a:focus-visible { outline:3px solid #2457FF !important; outline-offset:3px !important; }
      .technical-row:hover td { background-color:#D9FF43 !important; color:#171713 !important; }
      @media only screen and (max-width:620px) {
        .email-shell { width:100% !important; }
        .outer-padding { padding:20px 10px 28px !important; }
        .content-padding { padding-left:20px !important; padding-right:20px !important; }
        .headline { font-size:42px !important; line-height:34px !important; }
        .header-cell { display:block !important; width:100% !important; }
        .status-cell { padding-top:14px !important; text-align:left !important; }
        .detail-label, .detail-value { display:block !important; width:auto !important; }
        .detail-value { padding-top:5px !important; text-align:left !important; }
        .pipeline-step { display:block !important; width:auto !important; border-right:0 !important; border-bottom:1px solid #171713 !important; }
        .pipeline-step:last-child { border-bottom:0 !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#E5E0D4; color:#171713;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      ${email} solicitó descargar tu CV y su registro fue confirmado en DynamoDB.
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#E5E0D4;">
      <tr>
        <td align="center" class="outer-padding" style="padding:42px 16px 50px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:640px; max-width:640px; background-color:#F1EEE5; border:2px solid #171713; box-shadow:8px 8px 0 #FF4D00;">
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="76" align="center" style="width:76px; padding:14px 8px; background-color:#171713; color:#F1EEE5; font-size:13px; line-height:18px; font-weight:900; letter-spacing:0.12em;">JA</td>
                    <td width="58" align="center" style="width:58px; padding:14px 6px; border-right:1px solid #171713; background-color:#FF4D00; color:#171713; font-size:11px; line-height:18px; font-weight:900; letter-spacing:0.08em;">/01</td>
                    <td style="padding:14px 16px; color:#65635C; font-size:10px; line-height:18px; font-weight:800; letter-spacing:0.14em; text-transform:uppercase;">Portfolio system / event log</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:13px 28px; border-bottom:1px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="header-cell" style="color:#65635C; font-size:9px; line-height:16px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase;">Bogotá, CO&nbsp;&nbsp;/&nbsp;&nbsp;Resume requests&nbsp;&nbsp;/&nbsp;&nbsp;2026</td>
                    <td class="header-cell status-cell" align="right" style="white-space:nowrap; color:#171713; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.12em; text-transform:uppercase;"><span style="color:#FF4D00; font-size:15px; vertical-align:-1px;">●</span>&nbsp; Procesada</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:34px 28px 28px; border-bottom:2px solid #171713; font-family:'Arial Narrow','Aptos Display','Roboto Condensed',Arial,sans-serif;">
                <p style="margin:0 0 12px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:16px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase;">[Nueva actividad] / Ref. CV-01</p>
                <h1 class="headline" style="margin:0; max-width:560px; color:#171713; font-size:62px; line-height:50px; letter-spacing:-0.065em; font-stretch:condensed; font-weight:900; text-transform:uppercase;">Solicitud<br><span style="color:#FF4D00;">de CV.</span></h1>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px; border-top:1px solid #171713;">
                  <tr>
                    <td width="36" valign="top" style="width:36px; padding-top:17px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:11px; font-weight:900;">→</td>
                    <td style="padding-top:14px; color:#65635C; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:15px; line-height:24px;">El visitante <strong style="color:#171713; font-weight:800; word-break:break-word;">${email}</strong> solicitó el documento. La auditoría quedó registrada antes de emitir esta notificación.</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#D9FF43;">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:19px 8px; border-right:1px solid #171713; background-color:#171713; color:#D9FF43; font-size:22px; line-height:24px; font-weight:900;">✓</td>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 3px; color:#171713; font-size:10px; line-height:15px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase;">Persistencia confirmada</p>
                      <p style="margin:0; color:#171713; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:13px; line-height:20px;">El registro está disponible en la tabla de DynamoDB.</p>
                    </td>
                    <td width="58" align="center" style="width:58px; padding:16px 8px; border-left:1px solid #171713; color:#171713; font-size:9px; line-height:14px; font-weight:900; letter-spacing:0.08em;">200<br>OK</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:16px 8px; border-right:1px solid #171713; background-color:#2457FF; color:#F8F5EC; font-size:18px; font-weight:900;">02</td>
                    <td style="padding:16px 18px; color:#171713; font-size:11px; line-height:17px; font-weight:900; letter-spacing:0.13em; text-transform:uppercase;">Matriz de datos / Request payload</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" style="padding:13px 20px 13px 28px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">01 / Correo</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; border-bottom:1px solid #AAA79D; color:#2457FF; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:14px; line-height:20px; font-weight:700; text-align:right; word-break:break-word;">${email}</td>
                  </tr>
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" style="padding:13px 20px 13px 28px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">02 / Solicitado</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; border-bottom:1px solid #AAA79D; color:#171713; font-size:11px; line-height:18px; text-align:right;">${requestedAt}</td>
                  </tr>
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" style="padding:13px 20px 13px 28px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">03 / Persistido</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; border-bottom:1px solid #AAA79D; color:#171713; font-size:11px; line-height:18px; text-align:right;">${persistenceTimestamp}</td>
                  </tr>
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" style="padding:13px 20px 13px 28px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">04 / Actualizaciones</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; border-bottom:1px solid #AAA79D; color:#26834F; font-size:11px; line-height:18px; font-weight:900; text-align:right;">${subscription}</td>
                  </tr>
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" valign="top" style="padding:13px 20px 13px 28px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">05 / Request ID</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; border-bottom:1px solid #AAA79D; color:#65635C; font-size:10px; line-height:17px; text-align:right; word-break:break-all;">${requestId}</td>
                  </tr>
                  <tr class="technical-row">
                    <td class="detail-label" width="34%" valign="top" style="padding:13px 20px 13px 28px; color:#65635C; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">06 / IP hash</td>
                    <td class="detail-value" style="padding:13px 28px 13px 20px; color:#65635C; font-size:10px; line-height:17px; text-align:right; word-break:break-all;">${ipHash}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-top:2px solid #171713; border-bottom:2px solid #171713; background-color:#F8F5EC; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="pipeline-step" width="25%" align="center" style="padding:14px 8px; border-right:1px solid #171713; color:#65635C; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.08em;">01<br><span style="color:#171713;">SQS</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:14px 8px; border-right:1px solid #171713; color:#65635C; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.08em;">02<br><span style="color:#171713;">LAMBDA</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:14px 8px; border-right:1px solid #171713; background-color:#D9FF43; color:#26834F; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.08em;">03 / OK<br><span style="color:#171713;">DYNAMODB</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:14px 8px; color:#65635C; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.08em;">04<br><span style="color:#171713;">GMAIL SMTP</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:20px 28px; background-color:#171713; color:#AAA79D; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:16px; letter-spacing:0.08em; text-transform:uppercase;">
                Notificación automática / portfolio-resume-requests-consumer<br>
                <span style="color:#D9FF43;">System request completed</span>&nbsp;&nbsp;·&nbsp;&nbsp;No es necesario responder
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
