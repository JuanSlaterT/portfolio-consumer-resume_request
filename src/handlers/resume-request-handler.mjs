import {
  createResumeRequestFailureReport,
  serializeException,
} from "../diagnostics/resume-request-failure-report.mjs";
import { parseResumeRequest } from "../messages/resume-request-message.mjs";

export function createResumeRequestHandler({
  resumeRequestService,
  failureEmailClient = null,
  logger = console,
  clock = () => new Date(),
}) {
  return async function handler(event, lambdaContext = {}) {
    const batchItemFailures = [];

    for (const record of event.Records ?? []) {
      let resumeRequest = null;

      try {
        resumeRequest = parseResumeRequest(record.body);
        await resumeRequestService.process(resumeRequest, {
          messageId: record.messageId,
        });
      } catch (error) {
        const failureReport = createResumeRequestFailureReport({
          record,
          resumeRequest,
          error,
          lambdaContext,
          clock,
        });

        logger.error("Resume request processing failed", failureReport);

        if (
          failureReport.firstFailure &&
          typeof failureEmailClient?.sendProcessingFailure === "function"
        ) {
          try {
            const emailId =
              await failureEmailClient.sendProcessingFailure(failureReport);

            logger.info?.("Processing failure email sent", {
              messageId: failureReport.messageId,
              requestId: failureReport.requestId,
              stage: failureReport.stage,
              receiveCount: failureReport.receiveCount,
              emailId,
            });
          } catch (notificationError) {
            logger.error("Processing failure email could not be sent", {
              messageId: failureReport.messageId,
              stage: failureReport.stage,
              notificationException: serializeException(notificationError),
            });
          }
        }

        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };
}
