import { createResumeRequestNotificationEmail } from "../../templates/resume-request-notification-email.mjs";
import { createEnglishResumeDeliveryEmail } from "../../templates/resume-delivery/resume-delivery-email-en.mjs";
import { createSpanishResumeDeliveryEmail } from "../../templates/resume-delivery/resume-delivery-email-es.mjs";
import { createResumeRequestFailureEmail } from "../../templates/resume-request-failure-email.mjs";

const DELIVERY_TEMPLATE_BY_LANGUAGE = Object.freeze({
  en: createEnglishResumeDeliveryEmail,
  es: createSpanishResumeDeliveryEmail,
});

export class GmailSmtpEmailClient {
  constructor({ transporter, cloudfrontUrl, from, recipient, subject }) {
    this.transporter = transporter;
    this.cloudfrontUrl = cloudfrontUrl;
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

  async sendResumeDelivery(resumeRequest) {
    const createEmail = DELIVERY_TEMPLATE_BY_LANGUAGE[resumeRequest.language];

    if (!createEmail) {
      throw new Error(`Unsupported resume language: ${resumeRequest.language}`);
    }

    const content = createEmail({ cloudfrontUrl: this.cloudfrontUrl });
    const result = await this.transporter.sendMail({
      from: this.from,
      to: resumeRequest.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
      headers: {
        "X-Resume-Request-Id": resumeRequest.requestId,
        "X-Resume-Language": resumeRequest.language,
      },
    });

    return result.messageId;
  }

  async sendProcessingFailure(report) {
    const content = createResumeRequestFailureEmail(report);
    const result = await this.transporter.sendMail({
      from: this.from,
      to: this.recipient,
      subject: content.subject,
      text: content.text,
      html: content.html,
      headers: {
        "X-SQS-Message-Id": report.messageId,
        "X-Lambda-Request-Id": report.awsRequestId,
        "X-Resume-Failure-Stage": report.stage,
        "X-SQS-Receive-Count": String(report.receiveCount),
      },
    });

    return result.messageId;
  }
}
