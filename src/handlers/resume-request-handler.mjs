import { parseResumeRequest } from "../messages/resume-request-message.mjs";

export function createResumeRequestHandler({
  resumeRequestService,
  logger = console,
}) {
  return async function handler(event) {
    const batchItemFailures = [];

    for (const record of event.Records ?? []) {
      try {
        const resumeRequest = parseResumeRequest(record.body);
        await resumeRequestService.process(resumeRequest, {
          messageId: record.messageId,
        });
      } catch (error) {
        logger.error("Resume request processing failed", {
          messageId: record.messageId,
          errorName: error?.name ?? "Error",
          errorMessage: error?.message ?? "Unknown error",
        });

        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };
}
