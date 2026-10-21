import StatusBadge from "./StatusBadge";

export default function DocumentCard({ document, onRetry, retrying = false }) {
  const fileType = (document.filename || "").split(".").pop().toUpperCase();

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
          <p className="document-error" role="alert">{document.error}</p>
        )}
      </div>

      <div className="document-actions">
        <StatusBadge status={document.status} />

        {document.status === "failed" && (
          <button
            type="button"
            className="retry-button"
            disabled={retrying}
            onClick={() => onRetry(document.id)}
          >
            {retrying ? "Retrying..." : "Retry"}
          </button>
        )}
      </div>
    </article>
  );
}
