export function parseResumeRequest(body) {
  let payload;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error("message body must be valid JSON");
  }

  if (payload === null || Array.isArray(payload) || typeof payload !== "object") {
    throw new Error("message body must be a JSON object");
  }

  return Object.freeze({
    requestId: payload.requestId,
    requestedAt: payload.requestedAt,
    ipHash: payload.ipHash,
    email: payload.email,
    subscribeToUpdates: payload.subscribeToUpdates,
    timestamp: payload.timestamp,
  });
}
