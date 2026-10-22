export default function ChatInput({
  question,
  setQuestion,
  loading,
  validationError,
  onSubmit,
}) {
  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!loading) {
        onSubmit(event);
      }
    }
  }

  return (
    <form className="chat-composer" onSubmit={onSubmit}>
      {validationError && (
        <p className="chat-validation-error" role="alert">
          {validationError}
        </p>
      )}

      <div className="chat-input-row">
        <label className="visually-hidden" htmlFor="chat-question">
          Ask a question about this paper
        </label>

        <textarea
          id="chat-question"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this paper..."
          rows={2}
          maxLength={5000}
          disabled={loading}
          aria-describedby="chat-input-help"
        />

        <button
          type="submit"
          className="chat-send-button"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Send"}
        </button>
      </div>

      <p className="chat-input-help" id="chat-input-help">
        Enter to send · Shift + Enter for a new line · Maximum 5,000 characters
      </p>
    </form>
  );
}