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

    const emailId = await this.emailClient.sendStoredNotification(resumeRequest);

    this.logger.info("Notification email sent", {
      messageId,
      requestId: resumeRequest.requestId,
      emailId,
    });

    return Object.freeze({
      requestId: resumeRequest.requestId,
      persistedAt,
      emailId,
    });
  }
}
