export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function readApiError(response: Response, fallback: string): Promise<ApiError> {
  const body: unknown = await response.json().catch(() => null);
  if (body && typeof body === "object") {
    const fields = body as Record<string, unknown>;
    const messages = [fields.detail, fields.error]
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0);
    if (messages.length) return new ApiError([...new Set(messages)].join(" "), response.status);
  }
  return new ApiError(response.status === 404
    ? "This dataset is no longer available. It may have expired; upload it again to continue."
    : fallback, response.status);
}

export function retryDataQuery(failureCount: number, error: Error) {
  return !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 1;
}
