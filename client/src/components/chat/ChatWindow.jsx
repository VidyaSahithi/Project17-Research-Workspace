import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  messages,
  onRetry,
  loading,
  onSuggestedQuestion,
}) {
  return (
    <div className="chat-window" aria-label="Research conversation">
      {messages.length === 0 ? (
        <div className="chat-empty-state">
          <div className="empty-chat-icon" aria-hidden="true">
            ✦
          </div>

          <h3>Start exploring your research</h3>

          <p>
            Ask a question about your paper to get a sample answer
            with citations to the relevant pages.
          </p>

          <div className="suggested-questions">
            <p>Try asking:</p>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                onSuggestedQuestion(
                  "What methodology did the researchers use?"
                )
              }
            >
              What methodology did they use?
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                onSuggestedQuestion(
                  "What are the limitations of this study?"
                )
              }
            >
              What are the limitations?
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRetry={onRetry}
              disabled={loading}
            />
          ))}
        </div>
      )}
    </div>
  );
}