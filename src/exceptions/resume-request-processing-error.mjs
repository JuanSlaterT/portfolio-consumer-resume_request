export class ResumeRequestProcessingError extends Error {
  constructor(stage, cause) {
    const originalError =
      cause instanceof Error ? cause : new Error(String(cause ?? "Unknown error"));

    super(
      `Resume request processing failed at ${stage}: ${originalError.message}`,
      { cause: originalError },
    );

    this.name = "ResumeRequestProcessingError";
    this.stage = stage;
  }
}
