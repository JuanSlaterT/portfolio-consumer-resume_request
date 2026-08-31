import { DuplicateResumeRequestError } from "../clients/aws/exceptions/duplicate-resume-request-error.mjs";
import { ResumeRequestProcessingError } from "../exceptions/resume-request-processing-error.mjs";

const PROCESSING_STAGE = Object.freeze({
  DYNAMODB_PERSISTENCE: "DYNAMODB_PERSISTENCE",
  ADMIN_NOTIFICATION: "ADMIN_NOTIFICATION",
  RESUME_DELIVERY: "RESUME_DELIVERY",
});

function wrapProcessingError(stage, error) {
  return error instanceof ResumeRequestProcessingError
    ? error
    : new ResumeRequestProcessingError(stage, error);
}

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
        throw wrapProcessingError(PROCESSING_STAGE.DYNAMODB_PERSISTENCE, error);
      }

      this.logger.info("Resume request already stored", {
        messageId,
        requestId: resumeRequest.requestId,
      });
    }

    let notificationEmailId;

    try {
      notificationEmailId = await this.emailClient.sendStoredNotification(
        resumeRequest,
        {
          persistedAt,
        },
      );
    } catch (error) {
      throw wrapProcessingError(PROCESSING_STAGE.ADMIN_NOTIFICATION, error);
    }

    this.logger.info("Administrative notification email sent", {
      messageId,
      requestId: resumeRequest.requestId,
      emailId: notificationEmailId,
    });

    let deliveryEmailId;

    try {
      deliveryEmailId = await this.emailClient.sendResumeDelivery(resumeRequest);
    } catch (error) {
      throw wrapProcessingError(PROCESSING_STAGE.RESUME_DELIVERY, error);
    }

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
