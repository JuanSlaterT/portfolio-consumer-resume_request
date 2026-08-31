export class MailjetProviderError extends Error {
  constructor(statusCode, message) {
    super(`Mailjet API request failed (${statusCode}): ${message}`);
    this.name = "MailjetProviderError";
    this.statusCode = statusCode;
  }
}
