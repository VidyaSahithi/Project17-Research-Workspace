
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

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

function parseResponse(status, responseText) {
  let data = null;

  if (status !== 204 && responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (status < 200 || status >= 300) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed with status ${status}.`;

    throw new ApiError(message, status, data);
  }

  return data;
}

export async function apiRequest(path, options = {}) {
  if (typeof path !== "string" || !path.startsWith("/")) {
    throw new ApiError("API path must start with '/'.");
  }

  const {
    body,
    headers: customHeaders,
    onUploadProgress,
    ...fetchOptions
  } = options;

  const headers = new Headers(customHeaders || {});
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;

  let requestBody = body;

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

  // Use XMLHttpRequest when upload progress is requested.
  if (isFormData && typeof onUploadProgress === "function") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(
        fetchOptions.method || "POST",
        `${API_BASE_URL}${path}`
      );

      headers.forEach((value, key) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          onUploadProgress(
            Math.round((event.loaded / event.total) * 100)
          );
        }
      });

      xhr.addEventListener("load", () => {
        try {
          resolve(parseResponse(xhr.status, xhr.responseText));
        } catch (error) {
          reject(error);
        }
      });

      xhr.addEventListener("error", () => {
        reject(
          new ApiError(
            "Unable to reach the server. Check your connection and backend."
          )
        );
      });

      xhr.addEventListener("abort", () => {
        reject(new ApiError("The request was cancelled."));
      });

      xhr.send(body);
    });
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

  return parseResponse(response.status, await response.text());
}
