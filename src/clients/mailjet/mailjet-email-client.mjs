import { MailjetProviderError } from "./exceptions/mailjet-provider-error.mjs";

function getProviderErrorMessage(responseBody) {
  return (
    responseBody?.Messages?.[0]?.Errors?.[0]?.ErrorMessage ??
    responseBody?.ErrorMessage ??
    "Unknown Mailjet API error"
  );
}

export class MailjetEmailClient {
  constructor({
    apiKey,
    apiSecret,
    apiUrl,
    from,
    recipient,
    subject,
    userAgent,
    fetchClient = fetch,
  }) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.apiUrl = apiUrl;
    this.from = from;
    this.recipient = recipient;
    this.subject = subject;
    this.userAgent = userAgent;
    this.fetchClient = fetchClient;
  }

  async sendStoredNotification(resumeRequest) {
    const credentials = Buffer.from(
      `${this.apiKey}:${this.apiSecret}`,
      "utf8",
    ).toString("base64");

    const response = await this.fetchClient(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        "User-Agent": this.userAgent,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: this.from },
            To: [{ Email: this.recipient }],
            Subject: this.subject,
            HTMLPart:
              "<p>Se guardó una nueva solicitud de descarga de tu <strong>CV</strong>.</p>",
            CustomID: resumeRequest.requestId,
          },
        ],
      }),
    });

    const responseBody = await response.json().catch(() => null);
    const result = responseBody?.Messages?.[0];

    if (!response.ok || result?.Status !== "success") {
      throw new MailjetProviderError(
        response.status,
        getProviderErrorMessage(responseBody),
      );
    }

    return result.To?.[0]?.MessageUUID ?? String(result.To?.[0]?.MessageID ?? "");
  }
}
