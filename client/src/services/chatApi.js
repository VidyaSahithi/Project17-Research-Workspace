import { apiRequest } from "./api";
import { getAuthHeaders } from "./authApi";
import { DEMO_DOCUMENT, getMockChatResponse } from "../mocks/chatMock";

export const USE_CHAT_MOCK =
  (import.meta.env.VITE_USE_MOCK || "false").toLowerCase() === "true";

export async function getChatDocuments() {
  if (USE_CHAT_MOCK) {
    return [{
      documentId: DEMO_DOCUMENT.id,
      title: DEMO_DOCUMENT.title,
      status: "COMPLETED",
    }];
  }

  const data = await apiRequest("/api/documents", {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  if (!data || !Array.isArray(data.documents)) {
    throw new Error("The documents API returned an invalid response.");
  }

  return data.documents;
}

export async function askChatQuestion({ documentId, question }) {
  const trimmedQuestion = question?.trim();

  if (!trimmedQuestion) {
    throw new Error("Enter a question before sending.");
  }

  if (USE_CHAT_MOCK) {
    return getMockChatResponse(trimmedQuestion);
  }

  if (!documentId) {
    throw new Error("Select a research document before asking a question.");
  }

  const data = await apiRequest("/api/chat", {
    method: "POST",
    headers: getAuthHeaders(),
    body: {
      documentId,
      question: trimmedQuestion,
    },
    cache: "no-store",
  });

  if (
    !data ||
    typeof data.answer !== "string" ||
    !Array.isArray(data.sources)
  ) {
    throw new Error("The chat API returned an invalid response.");
  }

  return data;
}
