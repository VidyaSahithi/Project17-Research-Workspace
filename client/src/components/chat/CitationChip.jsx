import { useState } from "react";

export default function CitationChip({ source }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="citation-item">
      <button
        type="button"
        className={`citation-chip ${expanded ? "expanded" : ""}`}
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        <span aria-hidden="true">▤</span>
        <span>{source.title}</span>
        <span className="citation-page">
          Page {source.page}
        </span>
        <span aria-hidden="true">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="citation-passage">
          <p className="citation-passage-label">
            Quoted passage
          </p>

          <blockquote>{source.text}</blockquote>

          <p className="citation-source-name">
            Source: {source.title}, page {source.page}
          </p>
        </div>
      )}
    </div>
  );
}