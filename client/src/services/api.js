
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// Keep mock mode enabled until the backend integration is ready.
export const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK || "true").toLowerCase() === "true";

export class ApiError extends Error {
  constructor(message, status = 0, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Shared request helper for all frontend services.
 *
 * Usage:
 * apiRequest("/api/auth/me")
 * apiRequest("/api/auth/login", {
 *   method: "POST",
 *   body: { email, password },
 * })
 *
 * For file uploads, pass FormData as the body.
 */
export async function apiRequest(path, options = {}) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new ApiError("API path must start with '/'.");
  }

  const { body, headers: customHeaders, ...fetchOptions } = options;
  const headers = new Headers(customHeaders || {});

  let requestBody = body;

  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  if (
    body !== undefined &&
    body !== null &&
    !isFormData &&
    typeof body !== "string"
  ) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    requestBody = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: requestBody,
    });
  } catch (error) {
    throw new ApiError(
      "Unable to reach the server. Check your connection and backend.",
      0,
      error instanceof Error ? error.message : null
    );
  }

  let data = null;

  if (response.status !== 204) {
    const responseText = await response.text();

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed with status ${response.status}.`;

    throw new ApiError(message, response.status, data);
  }

  return data;
}
