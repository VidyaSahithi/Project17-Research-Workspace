import { useState } from "react";

export default function CitationChip({ source }) {
  const [expanded, setExpanded] = useState(false);
  const hasPage = source.page !== null && source.page !== undefined;
  const pageLabel = hasPage ? `Page ${source.page}` : "Page unavailable";

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
        <span className="citation-page">{pageLabel}</span>
        <span aria-hidden="true">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="citation-passage">
          <p className="citation-passage-label">Quoted passage</p>
          <blockquote>{source.text}</blockquote>
          <p className="citation-source-name">
            {hasPage
              ? `Source: ${source.title}, page ${source.page}`
              : `Source: ${source.title} (page information unavailable)`}
          </p>
        </div>
      )}
    </div>
  );
}
