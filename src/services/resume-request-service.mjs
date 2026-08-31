import { DuplicateResumeRequestError } from "../clients/aws/exceptions/duplicate-resume-request-error.mjs";

export class ResumeRequestService {
  constructor({ resumeRequestRepository, emailClient, logger = console }) {
    this.resumeRequestRepository = resumeRequestRepository;
    this.emailClient = emailClient;
    this.logger = logger;
  }

  async process(resumeRequest, { messageId }) {
    let persistedAt = null;

    try {
      persistedAt = await this.resumeRequestRepository.store(resumeRequest);

      this.logger.info("Resume request stored", {
        messageId,
        requestId: resumeRequest.requestId,
        persistedAt,
      });
    } catch (error) {
      if (!(error instanceof DuplicateResumeRequestError)) {
        throw error;
      }

      this.logger.info("Resume request already stored", {
        messageId,
        requestId: resumeRequest.requestId,
      });
    }

    const notificationEmailId =
      await this.emailClient.sendStoredNotification(resumeRequest, {
        persistedAt,
      });

    this.logger.info("Administrative notification email sent", {
      messageId,
      requestId: resumeRequest.requestId,
      emailId: notificationEmailId,
    });

    const deliveryEmailId =
      await this.emailClient.sendResumeDelivery(resumeRequest);

    this.logger.info("Resume delivery email sent", {
      messageId,
      requestId: resumeRequest.requestId,
      language: resumeRequest.language,
      emailId: deliveryEmailId,
    });

    return Object.freeze({
      requestId: resumeRequest.requestId,
      persistedAt,
      notificationEmailId,
      deliveryEmailId,
    });
  }
}
