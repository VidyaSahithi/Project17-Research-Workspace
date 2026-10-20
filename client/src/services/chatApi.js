import { apiRequest } from "./api";
import { getAuthHeaders } from "./authApi";
import { getMockChatResponse } from "../mocks/chatMock";

const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK || "true").toLowerCase() === "true";

export async function askChatQuestion({ documentId, question }) {
  const trimmedQuestion = question?.trim();

  if (!trimmedQuestion) {
    throw new Error("Enter a question before sending.");
  }

  // Use the sample response while developing the UI.
  if (USE_MOCK) {
    return getMockChatResponse(trimmedQuestion);
  }

  if (!documentId) {
    throw new Error("Select a research document before asking a question.");
  }

  // Real API mode: use the agreed M6 request shape.
  const data = await apiRequest("/api/chat", {
    method: "POST",
    headers: getAuthHeaders(),
    body: {
      documentId,
      question: trimmedQuestion,
    },
    cache: "no-store",
  });

  if (!data || typeof data.answer !== "string" || !Array.isArray(data.sources)) {
    throw new Error("The chat API returned an invalid response.");
  }

  return data;
}