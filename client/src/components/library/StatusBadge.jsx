
const statusLabels = {
  ready: "Ready",
  processing: "Processing",
  extracting: "Extracting text",
  extraction: "Extracting text",
  embedding: "Generating embeddings",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  const normalized = statusLabels[status] ? status : "processing";

  return (
    <span className={`status-badge status-${normalized}`}>
      <span className="status-indicator" />
      {statusLabels[normalized]}
    </span>
  );
}
