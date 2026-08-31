const MAX_STACK_LENGTH = 8_000;
const MAX_PAYLOAD_LENGTH = 4_000;
const MAX_CAUSE_DEPTH = 4;

function truncate(value, maximumLength) {
  const text = String(value ?? "No disponible");

  if (text.length <= maximumLength) {
    return text;
  }

  return `${text.slice(0, maximumLength)}\n… [truncated]`;
}

function optionalErrorProperty(error, propertyName) {
  const value = error?.[propertyName];
  return value === undefined || value === null ? null : String(value);
}

export function serializeException(error, depth = 0) {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error ?? "Unknown error"));

  return Object.freeze({
    name: normalizedError.name || "Error",
    message: truncate(normalizedError.message || "Unknown error", 2_000),
    code: optionalErrorProperty(normalizedError, "code"),
    statusCode:
      optionalErrorProperty(normalizedError, "statusCode") ??
      (normalizedError.$metadata?.httpStatusCode === undefined
        ? null
        : String(normalizedError.$metadata.httpStatusCode)),
    responseCode: optionalErrorProperty(normalizedError, "responseCode"),
    retryable: optionalErrorProperty(normalizedError, "retryable"),
    stack: truncate(normalizedError.stack ?? "Stack trace unavailable", MAX_STACK_LENGTH),
    cause:
      normalizedError.cause && depth < MAX_CAUSE_DEPTH
        ? serializeException(normalizedError.cause, depth + 1)
        : null,
  });
}

function readRemainingTime(lambdaContext) {
  if (typeof lambdaContext?.getRemainingTimeInMillis !== "function") {
    return null;
  }

  try {
    return lambdaContext.getRemainingTimeInMillis();
  } catch {
    return null;
  }
}

function readReceiveCount(record) {
  const receiveCount = Number.parseInt(
    record?.attributes?.ApproximateReceiveCount ?? "1",
    10,
  );

  return Number.isSafeInteger(receiveCount) && receiveCount > 0
    ? receiveCount
    : 1;
}

function createPayloadSnapshot(record, resumeRequest) {
  if (resumeRequest) {
    return truncate(JSON.stringify(resumeRequest, null, 2), MAX_PAYLOAD_LENGTH);
  }

  return truncate(record?.body ?? "Message body unavailable", MAX_PAYLOAD_LENGTH);
}

export function createResumeRequestFailureReport({
  record,
  resumeRequest,
  error,
  lambdaContext,
  clock = () => new Date(),
}) {
  const receiveCount = readReceiveCount(record);

  return Object.freeze({
    failedAt: clock().toISOString(),
    stage:
      error?.stage ??
      (resumeRequest ? "UNCLASSIFIED_PROCESSING" : "SQS_MESSAGE_PARSE"),
    status: "RETRY_PENDING",
    dlqDisposition:
      "The original SQS record remains failed and is eligible for retry and DLQ redrive.",
    messageId: record?.messageId ?? "No disponible",
    requestId: resumeRequest?.requestId ?? "No disponible",
    receiveCount,
    firstFailure: receiveCount === 1,
    eventSourceArn:
      record?.eventSourceARN ?? record?.eventSourceArn ?? "No disponible",
    awsRegion: record?.awsRegion ?? "No disponible",
    sentTimestamp: record?.attributes?.SentTimestamp ?? "No disponible",
    firstReceiveTimestamp:
      record?.attributes?.ApproximateFirstReceiveTimestamp ?? "No disponible",
    functionName: lambdaContext?.functionName ?? "No disponible",
    functionVersion: lambdaContext?.functionVersion ?? "No disponible",
    awsRequestId: lambdaContext?.awsRequestId ?? "No disponible",
    logGroupName: lambdaContext?.logGroupName ?? "No disponible",
    logStreamName: lambdaContext?.logStreamName ?? "No disponible",
    remainingTimeInMillis: readRemainingTime(lambdaContext),
    payloadSnapshot: createPayloadSnapshot(record, resumeRequest),
    exception: serializeException(error),
  });
}
