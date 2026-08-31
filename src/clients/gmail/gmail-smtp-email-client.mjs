export class GmailSmtpEmailClient {
  constructor({ transporter, from, recipient, subject }) {
    this.transporter = transporter;
    this.from = from;
    this.recipient = recipient;
    this.subject = subject;
  }

  async sendStoredNotification(resumeRequest) {
    const result = await this.transporter.sendMail({
      from: this.from,
      to: this.recipient,
      subject: this.subject,
      text: "Se guardó una nueva solicitud de descarga de tu CV.",
      html: "<p>Se guardó una nueva solicitud de descarga de tu <strong>CV</strong>.</p>",
      headers: {
        "X-Resume-Request-Id": resumeRequest.requestId,
      },
    });

    return result.messageId;
  }
}
