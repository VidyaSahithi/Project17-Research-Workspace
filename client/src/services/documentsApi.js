
import { apiRequest } from "./api";
import { getAuthHeaders } from "./authApi";

// Confirm this path against the backend router before testing.
const UPLOAD_ENDPOINT = "/upload";

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

  return apiRequest(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });
}
