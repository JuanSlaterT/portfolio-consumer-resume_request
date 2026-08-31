import { createResumeRequestNotificationEmail } from "../../templates/resume-request-notification-email.mjs";

export class GmailSmtpEmailClient {
  constructor({ transporter, from, recipient, subject }) {
    this.transporter = transporter;
    this.from = from;
    this.recipient = recipient;
    this.subject = subject;
  }

  async sendStoredNotification(resumeRequest, { persistedAt = null } = {}) {
    const content = createResumeRequestNotificationEmail(resumeRequest, {
      persistedAt,
    });

    const result = await this.transporter.sendMail({
      from: this.from,
      to: this.recipient,
      subject: this.subject,
      text: content.text,
      html: content.html,
      headers: {
        "X-Resume-Request-Id": resumeRequest.requestId,
      },
    });

    return result.messageId;
  }
}
