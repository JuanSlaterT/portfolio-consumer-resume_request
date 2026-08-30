export class DuplicateResumeRequestError extends Error {
  constructor(requestId, options) {
    super(`Resume request ${requestId} is already stored`, options);
    this.name = "DuplicateResumeRequestError";
    this.requestId = requestId;
  }
}
