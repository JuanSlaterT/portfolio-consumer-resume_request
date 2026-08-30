import { ResendProviderError } from "./exceptions/resend-provider-error.mjs";

export class ResendEmailClient {
  constructor({
    apiKey,
    apiUrl,
    from,
    recipient,
    subject,
    userAgent,
    fetchClient = fetch,
  }) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.from = from;
    this.recipient = recipient;
    this.subject = subject;
    this.userAgent = userAgent;
    this.fetchClient = fetchClient;
  }

  async sendStoredNotification(resumeRequest) {
    const response = await this.fetchClient(this.apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `resume-request/${resumeRequest.requestId}`,
        "User-Agent": this.userAgent,
      },
      body: JSON.stringify({
        from: this.from,
        to: [this.recipient],
        subject: this.subject,
        html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
      }),
    });

    const responseBody = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ResendProviderError(
        response.status,
        responseBody?.message ?? "Unknown Resend API error",
      );
    }

    return responseBody?.id;
  }
}
