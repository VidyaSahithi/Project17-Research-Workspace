import CitationChip from "./CitationChip";

export default function MessageBubble({
  message,
  onRetry,
  disabled,
}) {
  const isUser = message.role === "user";

  if (message.status === "loading") {
    return (
      <article className="chat-message assistant-message">
        <div className="message-avatar" aria-hidden="true">
          AI
        </div>

        <div className="message-content">
          <p className="message-author">
            Research Assistant
          </p>

          <div
            className="message-bubble typing-indicator"
            role="status"
          >
            <span className="typing-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            Preparing an answer...
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`chat-message ${
        isUser ? "user-message" : "assistant-message"
      }`}
    >
      {!isUser && (
        <div className="message-avatar" aria-hidden="true">
          AI
        </div>
      )}

      <div className="message-content">
        <p className="message-author">
          {isUser ? "You" : "Research Assistant"}
        </p>

        {message.status === "error" ? (
          <div className="chat-request-error" role="alert">
            <p>{message.content}</p>

            <button
              type="button"
              className="retry-button"
              disabled={disabled}
              onClick={() => onRetry(message)}
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            <div className="message-bubble">
              <p className="message-text">
                {message.content}
              </p>
            </div>

            {!isUser && message.sources?.length > 0 && (
              <div className="message-citations">
                <p className="citations-heading">
                  Sources ({message.sources.length})
                </p>

                {message.sources.map((source, index) => (
                  <CitationChip
                    key={`${source.documentId}-${source.page}-${index}`}
                    source={source}
                  />
                ))}
              </div>
            )}

            {!isUser &&
              message.status !== "loading" &&
              message.sources?.length === 0 && (
                <div
                  className="insufficient-evidence"
                  role="status"
                >
                  <strong>Not enough evidence</strong>
                  <p>
                    The selected paper did not provide supporting
                    passages for this answer. Try a more specific
                    question about the paper.
                  </p>
                </div>
              )}
          </>
        )}
      </div>
    </article>
  );
}