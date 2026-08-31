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

function sanitizeHeader(value) {
  return String(value ?? EMPTY_VALUE)
    .replace(/[\r\n]+/g, " ")
    .slice(0, 160);
}

function createExceptionTrace(exception) {
  const sections = [];
  let currentException = exception;
  let depth = 0;

  while (currentException) {
    const providerDetails = [
      currentException.code ? `code=${currentException.code}` : null,
      currentException.statusCode
        ? `statusCode=${currentException.statusCode}`
        : null,
      currentException.responseCode
        ? `responseCode=${currentException.responseCode}`
        : null,
      currentException.retryable
        ? `retryable=${currentException.retryable}`
        : null,
    ].filter(Boolean);

    sections.push(
      [
        `[${depth === 0 ? "EXCEPTION" : `CAUSE ${depth}`}] ${currentException.name}`,
        currentException.message,
        providerDetails.join(" · "),
        currentException.stack,
      ]
        .filter(Boolean)
        .join("\n"),
    );

    currentException = currentException.cause;
    depth += 1;
  }

  return sections.join("\n\n");
}

function createDetailRow(index, label, value, valueColor = "#171713") {
  return `<tr>
    <td class="detail-label" width="38%" style="padding:12px 18px 12px 24px; border-bottom:1px solid #AAA79D; color:#65635C; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.12em; text-transform:uppercase;">${escapeHtml(index)} / ${escapeHtml(label)}</td>
    <td class="detail-value" style="padding:12px 24px 12px 18px; border-bottom:1px solid #AAA79D; color:${valueColor}; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:17px; font-weight:800; text-align:right; word-break:break-word;">${escapeHtml(value)}</td>
  </tr>`;
}

export function createResumeRequestFailureEmail(report) {
  const exceptionTrace = createExceptionTrace(report.exception);
  const subject = `[ERROR] SQS/Lambda · ${sanitizeHeader(report.stage)} · ${sanitizeHeader(report.messageId)}`;

  const text = [
    "Fallo durante la ejecución de una solicitud de CV",
    "",
    `Estado: ${report.status}`,
    `Etapa: ${report.stage}`,
    `Fecha UTC: ${report.failedAt}`,
    `Intento SQS: ${report.receiveCount}`,
    `Message ID: ${report.messageId}`,
    `Request ID: ${report.requestId}`,
    `Lambda Request ID: ${report.awsRequestId}`,
    `Función: ${report.functionName}:${report.functionVersion}`,
    `Región: ${report.awsRegion}`,
    `Event source ARN: ${report.eventSourceArn}`,
    `CloudWatch log: ${report.logGroupName} / ${report.logStreamName}`,
    `Tiempo restante: ${report.remainingTimeInMillis ?? EMPTY_VALUE} ms`,
    "",
    "Excepción:",
    exceptionTrace,
    "",
    "Payload inspeccionado:",
    report.payloadSnapshot,
    "",
    "El registro original fue incluido en batchItemFailures. SQS aplicará los reintentos y el redrive a la DLQ configurada.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(subject)}</title>
    <style>
      @media only screen and (max-width:620px) {
        .email-shell { width:100% !important; }
        .outer-padding { padding:20px 10px 28px !important; }
        .content-padding { padding-left:20px !important; padding-right:20px !important; }
        .headline { font-size:40px !important; line-height:34px !important; }
        .header-cell { display:block !important; width:100% !important; }
        .status-cell { padding-top:14px !important; text-align:left !important; }
        .detail-label, .detail-value { display:block !important; width:auto !important; text-align:left !important; }
        .detail-value { padding-top:4px !important; }
        .pipeline-step { display:block !important; width:auto !important; border-right:0 !important; border-bottom:1px solid #171713 !important; }
        .pipeline-step:last-child { border-bottom:0 !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#E5E0D4; color:#171713;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">Falló ${escapeHtml(report.stage)} para el mensaje ${escapeHtml(report.messageId)}. Intento SQS ${escapeHtml(report.receiveCount)}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#E5E0D4;">
      <tr>
        <td align="center" class="outer-padding" style="padding:42px 16px 50px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:640px; max-width:640px; background-color:#F1EEE5; border:2px solid #171713; box-shadow:8px 8px 0 #B52E00;">
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="76" align="center" style="width:76px; padding:14px 8px; background-color:#171713; color:#F1EEE5; font-size:13px; line-height:18px; font-weight:900; letter-spacing:0.12em;">JA</td>
                    <td width="58" align="center" style="width:58px; padding:14px 6px; border-right:1px solid #171713; background-color:#FF4D00; color:#171713; font-size:11px; line-height:18px; font-weight:900; letter-spacing:0.08em;">/99</td>
                    <td style="padding:14px 16px; color:#65635C; font-size:10px; line-height:18px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Portfolio system / failure event log</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:13px 28px; border-bottom:1px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="header-cell" style="color:#65635C; font-size:9px; line-height:16px; font-weight:800; letter-spacing:0.13em; text-transform:uppercase;">Ref. ERR-99&nbsp;&nbsp;/&nbsp;&nbsp;SQS → Lambda&nbsp;&nbsp;/&nbsp;&nbsp;Attempt ${escapeHtml(report.receiveCount)}</td>
                    <td class="header-cell status-cell" align="right" style="white-space:nowrap; color:#B52E00; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.11em; text-transform:uppercase;"><span style="color:#FF4D00; font-size:15px; vertical-align:-1px;">■</span>&nbsp; Execution failed</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:36px 28px 28px; border-bottom:2px solid #171713; font-family:'Arial Narrow','Aptos Display','Roboto Condensed',Arial,sans-serif;">
                <p style="margin:0 0 12px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:16px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase;">[System request] / Critical event</p>
                <h1 class="headline" style="margin:0; color:#171713; font-size:58px; line-height:48px; letter-spacing:-0.065em; font-stretch:condensed; font-weight:900; text-transform:uppercase;">Fallo de<br><span style="color:#FF4D00;">ejecución.</span></h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FF4D00;">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:20px 8px; border-right:1px solid #171713; background-color:#171713; color:#FF4D00; font-size:24px; line-height:24px; font-weight:900;">!</td>
                    <td style="padding:16px 18px; color:#171713;">
                      <p style="margin:0 0 4px; font-size:10px; line-height:15px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(report.stage)}</p>
                      <p style="margin:0; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:14px; line-height:21px; font-weight:800;">${escapeHtml(report.exception.message)}</p>
                    </td>
                    <td width="72" align="center" style="width:72px; padding:16px 8px; border-left:1px solid #171713; color:#171713; font-size:9px; line-height:14px; font-weight:900; letter-spacing:0.08em;">${escapeHtml(report.status)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:16px 8px; border-right:1px solid #171713; background-color:#2457FF; color:#F8F5EC; font-size:18px; font-weight:900;">01</td>
                    <td style="padding:16px 18px; color:#171713; font-size:10px; line-height:17px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">Execution context / Failure metadata</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
                  ${createDetailRow("01", "Fecha UTC", report.failedAt)}
                  ${createDetailRow("02", "Etapa", report.stage, "#B52E00")}
                  ${createDetailRow("03", "Intento SQS", report.receiveCount, "#FF4D00")}
                  ${createDetailRow("04", "Message ID", report.messageId)}
                  ${createDetailRow("05", "Request ID", report.requestId)}
                  ${createDetailRow("06", "Lambda request", report.awsRequestId)}
                  ${createDetailRow("07", "Función", `${report.functionName}:${report.functionVersion}`)}
                  ${createDetailRow("08", "Región", report.awsRegion, "#2457FF")}
                  ${createDetailRow("09", "Source ARN", report.eventSourceArn)}
                  ${createDetailRow("10", "Log group", report.logGroupName)}
                  ${createDetailRow("11", "Log stream", report.logStreamName)}
                  ${createDetailRow("12", "Tiempo restante", report.remainingTimeInMillis === null ? EMPTY_VALUE : `${report.remainingTimeInMillis} ms`, "#26834F")}
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:26px 28px; border-top:2px solid #171713; border-bottom:2px solid #171713; background-color:#171713;">
                <p style="margin:0 0 12px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.15em; text-transform:uppercase;">02 / Exception trace</p>
                <pre style="margin:0; white-space:pre-wrap; word-break:break-word; color:#D9FF43; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:17px;">${escapeHtml(exceptionTrace)}</pre>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:1px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:16px 8px; border-right:1px solid #171713; background-color:#2457FF; color:#F8F5EC; font-size:18px; font-weight:900;">03</td>
                    <td style="padding:16px 18px; color:#171713; font-size:10px; line-height:17px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">Payload snapshot / Max. 4 KB</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:22px 28px; border-bottom:2px solid #171713; background-color:#F8F5EC;">
                <pre style="margin:0; white-space:pre-wrap; word-break:break-word; color:#2457FF; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:17px;">${escapeHtml(report.payloadSnapshot)}</pre>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#D9FF43;">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:20px 8px; border-right:1px solid #171713; background-color:#171713; color:#D9FF43; font-size:20px; line-height:22px; font-weight:900;">↻</td>
                    <td style="padding:16px 18px;">
                      <p style="margin:0 0 4px; color:#171713; font-size:10px; line-height:15px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">Retry / DLQ preservado</p>
                      <p style="margin:0; color:#171713; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:13px; line-height:20px;">El registro original se devuelve en <strong>batchItemFailures</strong>. SQS aplicará los reintentos y el redrive configurado hacia la DLQ.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; background-color:#F8F5EC; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="pipeline-step" width="25%" align="center" style="padding:15px 8px; border-right:1px solid #171713; color:#65635C; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.08em;">01 / RECEIVED<br><span style="color:#171713; font-size:9px;">SQS</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:15px 8px; border-right:1px solid #171713; background-color:#FF4D00; color:#171713; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.08em;">02 / FAILED<br><span style="font-size:9px;">LAMBDA</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:15px 8px; border-right:1px solid #171713; color:#2457FF; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.08em;">03 / PENDING<br><span style="color:#171713; font-size:9px;">RETRY / DLQ</span></td>
                    <td class="pipeline-step" width="25%" align="center" style="padding:15px 8px; background-color:#D9FF43; color:#26834F; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.08em;">04 / ALERT<br><span style="color:#171713; font-size:9px;">GMAIL SMTP</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:20px 28px; background-color:#171713; color:#AAA79D; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:16px; letter-spacing:0.07em; text-transform:uppercase;">
                Diagnóstico automático / portfolio-resume-requests-consumer<br>
                <span style="color:#FF4D00;">Action required</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:#F1EEE5;">Revisar excepción y CloudWatch log stream</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return Object.freeze({ subject, text, html });
}
