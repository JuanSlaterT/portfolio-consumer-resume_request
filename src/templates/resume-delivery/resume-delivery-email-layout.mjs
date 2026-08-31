function escapeHtml(value) {
  return String(value).replace(
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

export function createCloudFrontFileUrl(cloudfrontUrl, fileName) {
  const baseUrl = cloudfrontUrl.endsWith("/")
    ? cloudfrontUrl
    : `${cloudfrontUrl}/`;
  const downloadUrl = new URL(fileName, baseUrl);

  if (downloadUrl.protocol !== "https:") {
    throw new Error("CLOUDFRONT_URL must use HTTPS");
  }

  return downloadUrl.toString();
}

export function createResumeDeliveryEmailLayout({
  language,
  subject,
  preheader,
  badge,
  eyebrow,
  headline,
  headlineAccent,
  description,
  fileLabel,
  fileName,
  buttonLabel,
  helperText,
  footerText,
  downloadUrl,
}) {
  const safeDownloadUrl = escapeHtml(downloadUrl);
  const safeFileName = escapeHtml(fileName);

  const text = [
    `${headline} ${headlineAccent}`,
    "",
    description,
    "",
    `${fileLabel}: ${fileName}`,
    `${buttonLabel}: ${downloadUrl}`,
    "",
    helperText,
    "",
    footerText,
  ].join("\n");

  const html = `<!doctype html>
<html lang="${escapeHtml(language)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>${escapeHtml(subject)}</title>
    <style>
      .download-button:hover { transform:translate(2px,2px) !important; box-shadow:2px 2px 0 #FF4D00 !important; }
      .download-button:active { transform:translate(4px,4px) !important; box-shadow:0 0 0 #FF4D00 !important; }
      .download-button:focus-visible { outline:3px solid #2457FF !important; outline-offset:4px !important; }
      @media only screen and (max-width:620px) {
        .email-shell { width:100% !important; }
        .outer-padding { padding:20px 10px 28px !important; }
        .content-padding { padding-left:20px !important; padding-right:20px !important; }
        .headline { font-size:42px !important; line-height:35px !important; }
        .header-cell { display:block !important; width:100% !important; }
        .status-cell { padding-top:14px !important; text-align:left !important; }
        .download-button { display:block !important; padding-left:18px !important; padding-right:18px !important; text-align:center !important; }
        .route-step { display:block !important; width:auto !important; border-right:0 !important; border-bottom:1px solid #171713 !important; }
        .route-step:last-child { border-bottom:0 !important; }
        .file-icon, .file-copy { display:block !important; width:auto !important; }
        .file-icon { border-right:0 !important; border-bottom:1px solid #171713 !important; text-align:left !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#E5E0D4; color:#171713;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#E5E0D4;">
      <tr>
        <td align="center" class="outer-padding" style="padding:42px 16px 50px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:640px; max-width:640px; background-color:#F1EEE5; border:2px solid #171713; box-shadow:8px 8px 0 #FF4D00;">
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="76" align="center" style="width:76px; padding:14px 8px; background-color:#171713; color:#F1EEE5; font-size:13px; line-height:18px; font-weight:900; letter-spacing:0.12em;">JA</td>
                    <td width="58" align="center" style="width:58px; padding:14px 6px; border-right:1px solid #171713; background-color:#FF4D00; color:#171713; font-size:11px; line-height:18px; font-weight:900; letter-spacing:0.08em;">/02</td>
                    <td style="padding:14px 16px; color:#65635C; font-size:10px; line-height:18px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">Juan Arévalo / document delivery</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:13px 28px; border-bottom:1px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="header-cell" style="color:#65635C; font-size:9px; line-height:16px; font-weight:800; letter-spacing:0.15em; text-transform:uppercase;">Ref. CV-02&nbsp;&nbsp;/&nbsp;&nbsp;HTTPS&nbsp;&nbsp;/&nbsp;&nbsp;CloudFront</td>
                    <td class="header-cell status-cell" align="right" style="white-space:nowrap; color:#171713; font-size:9px; line-height:16px; font-weight:900; letter-spacing:0.11em; text-transform:uppercase;"><span style="color:#FF4D00; font-size:15px; vertical-align:-1px;">●</span>&nbsp; ${escapeHtml(badge)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:38px 28px 30px; border-bottom:2px solid #171713; font-family:'Arial Narrow','Aptos Display','Roboto Condensed',Arial,sans-serif;">
                <p style="margin:0 0 13px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:16px; font-weight:900; letter-spacing:0.18em; text-transform:uppercase;">${escapeHtml(eyebrow)} / [Ready]</p>
                <h1 class="headline" style="margin:0; max-width:570px; color:#171713; font-size:62px; line-height:50px; letter-spacing:-0.065em; font-stretch:condensed; font-weight:900; text-transform:uppercase;">${escapeHtml(headline)}<br><span style="color:#FF4D00;">${escapeHtml(headlineAccent)}</span></h1>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:28px; border-top:1px solid #171713;">
                  <tr>
                    <td width="36" valign="top" style="width:36px; padding-top:17px; color:#FF4D00; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:11px; font-weight:900;">→</td>
                    <td style="padding-top:14px; color:#65635C; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:15px; line-height:24px;">${escapeHtml(description)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="64" align="center" style="width:64px; padding:16px 8px; border-right:1px solid #171713; background-color:#2457FF; color:#F8F5EC; font-size:18px; line-height:22px; font-weight:900;">03</td>
                    <td style="padding:16px 18px; background-color:#171713; color:#F1EEE5; font-size:10px; line-height:17px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">Document package / Secure asset</td>
                    <td width="72" align="center" style="width:72px; padding:16px 8px; background-color:#D9FF43; color:#171713; font-size:9px; line-height:14px; font-weight:900; letter-spacing:0.08em;">PDF<br>READY</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:26px 28px 28px; border-bottom:2px solid #171713;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8F5EC; border:2px solid #171713; box-shadow:6px 6px 0 #171713;">
                  <tr>
                    <td class="file-icon" width="122" align="center" valign="middle" style="width:122px; padding:28px 14px; border-right:2px solid #171713; background-color:#2457FF; color:#F8F5EC; font-family:'Arial Narrow','Aptos Display','Roboto Condensed',Arial,sans-serif; font-size:34px; line-height:34px; font-weight:900; letter-spacing:-0.04em;">PDF<span style="display:block; margin-top:8px; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:8px; line-height:13px; letter-spacing:0.14em;">/ APPLICATION</span></td>
                    <td class="file-copy" valign="middle" style="padding:23px 22px;">
                      <p style="margin:0 0 8px; color:#65635C; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.14em; text-transform:uppercase;">${escapeHtml(fileLabel)}</p>
                      <p style="margin:0; color:#171713; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:12px; line-height:19px; font-weight:800; word-break:break-all;">${safeFileName}</p>
                      <p style="margin:12px 0 0; color:#26834F; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:15px; font-weight:900; letter-spacing:0.12em; text-transform:uppercase;">✓ Verified resource</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
                  <tr>
                    <td>
                      <a href="${safeDownloadUrl}" target="_blank" rel="noopener" class="download-button" style="display:inline-block; padding:14px 22px; border:2px solid #171713; background-color:#171713; box-shadow:4px 4px 0 #FF4D00; color:#F1EEE5; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:10px; line-height:18px; font-weight:900; letter-spacing:0.13em; text-decoration:none; text-transform:uppercase;">${escapeHtml(buttonLabel)} &nbsp;↘</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:18px; color:#65635C; font-family:'Segoe UI',Aptos,Helvetica,Arial,sans-serif; font-size:12px; line-height:20px;">${escapeHtml(helperText)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0; border-bottom:2px solid #171713; background-color:#F8F5EC; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td class="route-step" width="33.33%" align="center" style="padding:16px 9px; border-right:1px solid #171713; color:#65635C; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.11em;">01 / ORIGIN<br><span style="color:#171713; font-size:10px;">PORTFOLIO</span></td>
                    <td class="route-step" width="33.33%" align="center" style="padding:16px 9px; border-right:1px solid #171713; color:#2457FF; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.11em;">02 / EDGE<br><span style="color:#171713; font-size:10px;">CLOUDFRONT</span></td>
                    <td class="route-step" width="33.33%" align="center" style="padding:16px 9px; background-color:#D9FF43; color:#26834F; font-size:8px; line-height:14px; font-weight:900; letter-spacing:0.11em;">03 / READY<br><span style="color:#171713; font-size:10px;">SECURE PDF</span></td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:20px 28px; background-color:#171713; color:#AAA79D; font-family:SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace; font-size:9px; line-height:16px; letter-spacing:0.07em; text-transform:uppercase;">
                ${escapeHtml(footerText)}<br>
                <span style="color:#D9FF43;">portfolio.juanarevalo.dev</span>&nbsp;&nbsp;·&nbsp;&nbsp;<span style="color:#F1EEE5;">HTTPS / CloudFront</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return Object.freeze({ subject, text, html, downloadUrl });
}
