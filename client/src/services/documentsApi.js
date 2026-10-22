
import { apiRequest, API_BASE_URL } from "./api";
import { getAuthHeaders } from "./authApi";

const DOCUMENTS_ENDPOINT = "/api/documents";
const MAX_FILE_SIZE = 20 * 1024 * 1024;

export async function listDocuments() {
  const data = await apiRequest(DOCUMENTS_ENDPOINT, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (Array.isArray(data)) {
    return data;
  }

  if (data && Array.isArray(data.documents)) {
    return data.documents;
  }

  throw new Error("The document list API returned an invalid response.");
}

export async function uploadDocument(file, onProgress) {
  if (!(file instanceof File)) {
    throw new Error("Please select a file to upload.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!["pdf", "txt"].includes(extension)) {
    throw new Error("Only PDF and TXT files are supported.");
  }

  if (file.size === 0) {
    throw new Error("This file is empty. Please choose another file.");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds the 20 MB limit.");
  }

  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`${DOCUMENTS_ENDPOINT}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
    onUploadProgress: onProgress,
  });
}

export async function getDocumentFileUrl(id) {
  if (!id) {
    throw new Error("A document ID is required to open this file.");
  }

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
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return URL.createObjectURL(await response.blob());
}

export async function retryDocument(documentId) {
  if (!documentId) {
    throw new Error("A document ID is required to retry processing.");
  }

  return apiRequest(
    `${DOCUMENTS_ENDPOINT}/${encodeURIComponent(documentId)}/retry`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      cache: "no-store",
    }
  );
}
