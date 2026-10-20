import { useState } from "react";
import { DEMO_DOCUMENT } from "../mocks/chatMock";
import { askChatQuestion } from "../services/chatApi";

import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import "./Chat.css";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function sendQuestion(event) {
    event?.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setValidationError("Enter a question before sending.");
      return;
    }

    if (loading) return;

    setValidationError("");
    setQuestion("");
    setLoading(true);

    const requestId = `${Date.now()}-${Math.random()}`;
    const assistantId = `${requestId}-answer`;

    const userMessage = {
      id: `${requestId}-question`,
      role: "user",
      content: trimmedQuestion,
    };

    const loadingMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      status: "loading",
      sources: [],
    };

    setMessages((current) => [
      ...current,
      userMessage,
      loadingMessage,
    ]);

    try {
      const result = await askChatQuestion({
  documentId: DEMO_DOCUMENT.id,
  question: trimmedQuestion,
});

      if (!result || typeof result.answer !== "string") {
        throw new Error("The response did not contain a valid answer.");
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: result.answer,
                sources: Array.isArray(result.sources)
                  ? result.sources
                  : [],
                status: "complete",
              }
            : message
        )
      );
    } catch (error) {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  error.message ||
                  "Unable to get an answer. Please try again.",
                status: "error",
                retryQuestion: trimmedQuestion,
              }
            : message
        )
      );
    } finally {
      setLoading(false);
    }
  }

  async function retryQuestion(message) {
    if (loading || !message.retryQuestion) return;

    const assistantId = message.id;
    const questionToRetry = message.retryQuestion;

    setValidationError("");
    setLoading(true);

    setMessages((current) =>
      current.map((item) =>
        item.id === assistantId
          ? {
              ...item,
              content: "",
              sources: [],
              status: "loading",
            }
          : item
      )
    );

    try {
      const result = await askChatQuestion({
  documentId: DEMO_DOCUMENT.id,
  question: questionToRetry,
});

      if (!result || typeof result.answer !== "string") {
        throw new Error("The response did not contain a valid answer.");
      }

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: result.answer,
                sources: Array.isArray(result.sources)
                  ? result.sources
                  : [],
                status: "complete",
                retryQuestion: undefined,
              }
            : item
        )
      );
    } catch (error) {
      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content:
                  error.message ||
                  "Unable to get an answer. Please try again.",
                status: "error",
              }
            : item
        )
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-page">
      <div className="chat-header">
        <p className="eyebrow">CITED RESEARCH ASSISTANT</p>
        <h2>Research Chat</h2>
        <p>
          Ask questions about a research paper and explore answers
          supported by page-level citations.
        </p>
      </div>

      <div className="chat-workspace">
        <div className="selected-paper">
          <div className="paper-icon" aria-hidden="true">
            PDF
          </div>

          <div className="paper-details">
            <span className="paper-label">RESEARCH PAPER</span>
            <strong>{DEMO_DOCUMENT.title}</strong>
          </div>

          <span className="demo-badge">Demo data</span>
        </div>

        <ChatWindow
          messages={messages}
          onRetry={retryQuestion}
          loading={loading}
          onSuggestedQuestion={setQuestion}
        />

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          validationError={validationError}
          onSubmit={sendQuestion}
        />
      </div>

      <p className="chat-demo-note">
        This is a mock demonstration. Answers and citations are examples,
        not verified findings from a real paper.
      </p>
    </section>
  );
}