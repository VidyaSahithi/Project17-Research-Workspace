
import { useState } from "react";
import { initialDocuments } from "../mocks/documentsMock";
import DocumentCard from "../components/library/DocumentCard";
import UploadButton from "../components/library/UploadButton";
import SearchBar from "../components/library/SearchBar";
import "./Documents.css";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function Documents() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");

  async function handleFileSelected(file) {
    setUploadError("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "txt"].includes(extension)) {
      setUploadError("Unsupported file type. Please select a PDF or TXT file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File exceeds the 20 MB limit. Please choose a smaller file.");
      return;
    }

    if (file.size === 0) {
      setUploadError("This file is empty. Please choose another file.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate uploading while using mock mode.
    for (const progress of [15, 35, 55, 75, 100]) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      setUploadProgress(progress);
    }

    const newId = `doc-${Date.now()}`;
    const newDocument = {
      id: newId,
      title: file.name.replace(/\.(pdf|txt)$/i, ""),
      filename: file.name,
      pages: null,
      size: file.size,
      status: "processing",
    };

    setDocuments((current) => [newDocument, ...current]);
    setUploading(false);
    setUploadProgress(0);

    // Mock processing only; no server request is made yet.
    setTimeout(() => {
      setDocuments((current) =>
        current.map((doc) =>
          doc.id === newId ? { ...doc, status: "ready" } : doc
        )
      );
    }, 4000);
  }

  function handleRetry(id) {
    setDocuments((current) =>
      current.map((doc) =>
        doc.id === id
          ? { ...doc, status: "processing", error: undefined }
          : doc
      )
    );

    // Simulate a successful retry in mock mode.
    setTimeout(() => {
      setDocuments((current) =>
        current.map((doc) =>
          doc.id === id ? { ...doc, status: "ready" } : doc
        )
      );
    }, 2500);
  }

  const filteredDocuments = documents.filter((doc) => {
    const query = search.trim().toLowerCase();

    return (
      doc.title.toLowerCase().includes(query) ||
      doc.filename.toLowerCase().includes(query)
    );
  });

  return (
    <section className="documents-page">
      <div className="library-heading">
        <div>
          <p className="eyebrow">YOUR RESEARCH WORKSPACE</p>
          <h2>My Research Papers</h2>
          <p>Manage, search, and organize your research documents.</p>
        </div>

        <UploadButton
          onFileSelected={handleFileSelected}
          uploading={uploading}
        />
      </div>

      <div className="library-toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <span className="document-count">
          {filteredDocuments.length}{" "}
          {filteredDocuments.length === 1 ? "document" : "documents"}
        </span>
      </div>

      {uploading && (
        <div className="upload-progress" role="status">
          <div className="progress-label">
            <span>Uploading document (demo)</span>
            <span>{uploadProgress}%</span>
          </div>

          <div
            className="progress-track"
            role="progressbar"
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {uploadError && (
        <p className="upload-error" role="alert">
          {uploadError}
        </p>
      )}

      <div className="document-list">
        {filteredDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onRetry={handleRetry}
          />
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="library-empty-state">
          {documents.length === 0 ? (
            <>
              <h3>Your library is empty</h3>
              <p>Upload a PDF or TXT file to get started.</p>
            </>
          ) : (
            <>
              <h3>No matching documents</h3>
              <p>Try a different search term.</p>
            </>
          )}
        </div>
      )}

      <p className="mock-mode-note">
        Demo mode: uploads and retries are simulated locally.
        Files are not sent to the backend yet.
      </p>
    </section>
  );
}
