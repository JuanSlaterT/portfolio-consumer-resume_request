export class ResendProviderError extends Error {
  constructor(statusCode, message) {
    super(`Resend API request failed (${statusCode}): ${message}`);
    this.name = "ResendProviderError";
    this.statusCode = statusCode;
  }
}
