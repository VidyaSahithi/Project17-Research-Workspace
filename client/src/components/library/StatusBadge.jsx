const statusLabels = {
  ready: "Ready",
  COMPLETED: "Ready",
  processing: "Processing",
  PROCESSING: "Processing",
  UPLOADED: "Uploaded",
  extracting: "Extracting text",
  extraction: "Extracting text",
  embedding: "Generating embeddings",
  failed: "Failed",
  FAILED: "Failed",
};

export default function StatusBadge({ status }) {
  const label = statusLabels[status] || "Processing";
  const normalized =
    status === "FAILED" || status === "failed"
      ? "failed"
      : status === "COMPLETED" || status === "ready"
        ? "ready"
        : "processing";

  return (
    <span className={`status-badge status-${normalized}`}>
      <span className="status-indicator" />
      {label}
    </span>
  );
}
