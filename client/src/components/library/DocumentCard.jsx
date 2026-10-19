
import StatusBadge from "./StatusBadge";

export default function DocumentCard({ document, onRetry }) {
  const fileType = document.filename.split(".").pop().toUpperCase();

  return (
    <article className="document-row">
      <div className="document-file-icon" aria-hidden="true">
        {fileType === "PDF" ? "PDF" : "TXT"}
      </div>

      <div className="document-details">
        <h3>{document.title}</h3>
        <p>
          {document.pages
            ? `${document.pages} pages`
            : document.size
              ? `${(document.size / (1024 * 1024)).toFixed(2)} MB`
              : document.filename}
        </p>

        {document.error && (
          <p className="document-error">{document.error}</p>
        )}
      </div>

      <div className="document-actions">
        <StatusBadge status={document.status} />

        {document.status === "failed" && (
          <button
            type="button"
            className="retry-button"
            onClick={() => onRetry(document.id)}
          >
            Retry
          </button>
        )}
      </div>
    </article>
  );
}
