import { useEffect, useState } from "react";
import { getChatDocuments, askChatQuestion, USE_CHAT_MOCK } from "../services/chatApi";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";
import "./Chat.css";

const getDocumentId = (document) =>
  document?.documentId || document?.id || document?._id || "";

export default function Chat() {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState("");
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentError, setDocumentError] = useState("");
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    let active = true;

    getChatDocuments()
      .then((items) => {
        if (!active) return;

        const available = Array.isArray(items) ? items : [];
        setDocuments(available);

        const firstCompleted = available.find(
          (item) => item.status === "COMPLETED"
        );

        setSelectedDocumentId(getDocumentId(firstCompleted));
      })
      .catch((error) => {
        if (active) {
          setDocumentError(error.message || "Unable to load your documents.");
        }
      })
      .finally(() => {
        if (active) setDocumentsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedDocument = documents.find(
    (document) => getDocumentId(document) === selectedDocumentId
  );

  const completedDocuments = documents.filter(
    (document) => document.status === "COMPLETED"
  );

  async function sendQuestion(event) {
    event?.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setValidationError("Enter a question before sending.");
      return;
    }

    if (loading) return;

    if (!selectedDocumentId) {
      setValidationError(
        "Select a completed document before asking a question."
      );
      return;
    }

    setValidationError("");
    setQuestion("");
    setLoading(true);

    const requestId = `${Date.now()}-${Math.random()}`;
    const assistantId = `${requestId}-answer`;

    setMessages((current) => [
      ...current,
      {
        id: `${requestId}-question`,
        role: "user",
        content: trimmedQuestion,
      },
      {
        id: assistantId,
        role: "assistant",
        content: "",
        status: "loading",
        sources: [],
        documentId: selectedDocumentId,
      },
    ]);

    try {
      const result = await askChatQuestion({
        documentId: selectedDocumentId,
        question: trimmedQuestion,
      });

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: result.answer,
                sources: result.sources,
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
                  error.message || "Unable to get an answer. Please try again.",
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

    const documentId = message.documentId || selectedDocumentId;
    const assistantId = message.id;

    setValidationError("");
    setLoading(true);

    setMessages((current) =>
      current.map((item) =>
        item.id === assistantId
          ? { ...item, content: "", sources: [], status: "loading" }
          : item
      )
    );

    try {
      const result = await askChatQuestion({
        documentId,
        question: message.retryQuestion,
      });

      setMessages((current) =>
        current.map((item) =>
          item.id === assistantId
            ? {
                ...item,
                content: result.answer,
                sources: result.sources,
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
                  error.message || "Unable to get an answer. Please try again.",
                status: "error",
                retryQuestion: message.retryQuestion,
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
          Ask questions about a research document and explore answers
          supported by retrieved evidence.
        </p>
      </div>

      <div className="chat-workspace">
        <div className="selected-paper">
          <div className="paper-icon" aria-hidden="true">PDF</div>

          <div className="paper-details">
            <span className="paper-label">RESEARCH DOCUMENT</span>
            <strong>
              {selectedDocument?.title ||
                (documentsLoading ? "Loading documents..." : "No document selected")}
            </strong>

            <select
              className="document-select"
              aria-label="Select a research document"
              value={selectedDocumentId}
              onChange={(event) => setSelectedDocumentId(event.target.value)}
              disabled={documentsLoading || completedDocuments.length === 0 || loading}
            >
              <option value="">Select a completed document</option>
              {completedDocuments.map((document) => {
                const id = getDocumentId(document);

                return (
                  <option key={id} value={id}>
                    {document.title}
                  </option>
                );
              })}
            </select>
          </div>

          <span className="demo-badge">
            {USE_CHAT_MOCK ? "Mock mode" : "Live API"}
          </span>
        </div>

        {documentError && (
          <p className="chat-document-error" role="alert">
            {documentError}
          </p>
        )}

        {!documentsLoading && !documentError && completedDocuments.length === 0 && (
          <p className="chat-document-error">
            No completed documents found. Upload a PDF or TXT file in Document
            Library and wait for processing to finish.
          </p>
        )}

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
        {USE_CHAT_MOCK
          ? "Mock mode is enabled. Answers and citations are examples, not verified findings."
          : "Answers are generated from retrieved passages. Page numbers are shown only when source metadata is available."}
      </p>
    </section>
  );
}
