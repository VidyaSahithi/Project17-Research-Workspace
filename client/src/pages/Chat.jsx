import "./Chat.css";

export default function Chat() {
  return (
    <section className="chat-page">
      <div className="chat-header">
        <p className="eyebrow">CITED RESEARCH ASSISTANT</p>
        <h2>Research Chat</h2>
        <p>
          Ask questions about a research paper and explore
          answers supported by page-level citations.
        </p>
      </div>

      <div className="chat-empty-state">
        <h3>Start exploring your research</h3>
        <p>
          Ask a question about your paper to get an answer
          with citations to the relevant pages.
        </p>
      </div>
    </section>
  );
}