
import { apiRequest, API_BASE_URL } from "./api";
import { getAuthHeaders } from "./authApi";

const DOCUMENTS_ENDPOINT = "/api/documents";

export async function uploadDocument(file) {
  if (!(file instanceof File)) {
    throw new Error("Please select a file to upload.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["pdf", "txt"].includes(extension)) {
    throw new Error("Only PDF and TXT files are supported.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`${DOCUMENTS_ENDPOINT}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}

export async function listDocuments() {
  return apiRequest(DOCUMENTS_ENDPOINT, {
    headers: getAuthHeaders(),
  });
}

export async function getDocumentFileUrl(id) {
  const response = await fetch(
    `${API_BASE_URL}${DOCUMENTS_ENDPOINT}/${encodeURIComponent(id)}/open`,
    { headers: getAuthHeaders() }
  );

  if (!response.ok) {
    let message = "Could not open document.";

    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Keep the default message.
    }

    throw new Error(message);
  }

  return URL.createObjectURL(await response.blob());
}
