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
    headline,
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
<html lang="${language}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="supported-color-schemes" content="dark">
    <title>${escapeHtml(subject)}</title>
    <style>
      @media only screen and (max-width:620px) {
        .email-shell { width:100% !important; }
        .content-padding { padding-left:22px !important; padding-right:22px !important; }
        .headline { font-size:32px !important; line-height:38px !important; }
        .download-button { display:block !important; text-align:center !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:#020617; color:#f1f5f9;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#020617;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="email-shell" style="width:600px; max-width:600px; background-color:#0b1220; border:1px solid #1e293b; border-radius:16px; overflow:hidden;">
            <tr>
              <td height="4" style="height:4px; background-color:#10b981; background-image:linear-gradient(90deg,#10b981 0%,#06b6d4 100%); font-size:0; line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:30px 38px 12px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td valign="middle">
                      <span style="display:inline-block; width:34px; height:34px; line-height:34px; text-align:center; border-radius:9px; background-color:#10b981; background-image:linear-gradient(135deg,#10b981,#06b6d4); color:#020617; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:13px; font-weight:800;">JB</span>
                      <span style="padding-left:10px; color:#cbd5e1; font-size:13px; font-weight:700; letter-spacing:0.04em;">JUAN ARÉVALO</span>
                    </td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block; padding:7px 11px; border:1px solid #14532d; border-radius:999px; background-color:#052e2b; color:#34d399; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase;">${escapeHtml(badge)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:38px 38px 8px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <p style="margin:0 0 13px; color:#34d399; font-size:12px; line-height:18px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase;">${escapeHtml(eyebrow)}</p>
                <h1 class="headline" style="margin:0; color:#ffffff; font-size:42px; line-height:48px; letter-spacing:-0.04em; font-weight:750;">${escapeHtml(headline)}</h1>
                <p style="margin:20px 0 0; max-width:500px; color:#94a3b8; font-size:16px; line-height:27px;">${escapeHtml(description)}</p>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:24px 38px 10px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0f172a; border:1px solid #1e293b; border-radius:13px;">
                  <tr>
                    <td width="48" valign="middle" style="padding:20px 0 20px 20px;">
                      <span style="display:inline-block; width:42px; height:42px; line-height:42px; text-align:center; border-radius:10px; background-color:#172033; color:#22d3ee; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:18px; font-weight:800;">PDF</span>
                    </td>
                    <td valign="middle" style="padding:20px 20px 20px 14px;">
                      <p style="margin:0 0 5px; color:#64748b; font-size:11px; line-height:16px; font-weight:750; letter-spacing:0.08em; text-transform:uppercase;">${escapeHtml(fileLabel)}</p>
                      <p style="margin:0; color:#e2e8f0; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:13px; line-height:19px; word-break:break-all;">${safeFileName}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:22px 38px 14px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <a href="${safeDownloadUrl}" target="_blank" class="download-button" style="display:inline-block; padding:14px 28px; border-radius:11px; background-color:#f59e0b; background-image:linear-gradient(90deg,#f59e0b 0%,#f97316 100%); color:#020617; font-size:14px; line-height:20px; font-weight:800; text-decoration:none;">${escapeHtml(buttonLabel)} &nbsp;↓</a>
                <p style="margin:15px 0 0; color:#64748b; font-size:12px; line-height:19px;">${escapeHtml(helperText)}</p>
              </td>
            </tr>
            <tr>
              <td class="content-padding" style="padding:24px 38px 30px; font-family:Inter,Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-top:20px; border-top:1px solid #1e293b; color:#475569; font-size:11px; line-height:18px;">${escapeHtml(footerText)}<br><span style="font-family:ui-monospace,SFMono-Regular,Consolas,monospace; color:#334155;">portfolio.juanarevalo.dev</span></td>
                    <td align="right" valign="bottom" style="padding-top:20px; border-top:1px solid #1e293b; color:#334155; font-family:ui-monospace,SFMono-Regular,Consolas,monospace; font-size:10px;">HTTPS · CLOUDFRONT</td>
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

  return Object.freeze({ subject, text, html, downloadUrl });
}
