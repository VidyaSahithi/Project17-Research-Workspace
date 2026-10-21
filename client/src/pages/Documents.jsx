import { useCallback, useEffect, useState } from "react";
import {
  listDocuments,
  uploadDocument,
  retryDocument,
} from "../services/documentsApi";
import DocumentCard from "../components/library/DocumentCard";
import UploadButton from "../components/library/UploadButton";
import SearchBar from "../components/library/SearchBar";
import "./Documents.css";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function mapDocument(document) {
  const filename = document.title || "Untitled document";
  const rawStatus = (document.status || "UPLOADED").toUpperCase();

  const statusMap = {
    UPLOADED: "processing",
    PROCESSING: "processing",
    COMPLETED: "ready",
    FAILED: "failed",
  };

  return {
    id: String(document.documentId || document._id),
    title: filename.replace(/\.(pdf|txt)$/i, ""),
    filename,
    pages: null,
    size: null,
    status: statusMap[rawStatus] || "processing",
    error:
      rawStatus === "FAILED"
        ? "Processing failed. Use Retry to try processing the stored file again."
        : undefined,
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [retryingId, setRetryingId] = useState("");
  const [retryErrors, setRetryErrors] = useState({});

  const refreshDocuments = useCallback(async () => {
    try {
      const remoteDocuments = await listDocuments();
      setDocuments(remoteDocuments.map(mapDocument));
      setListError("");
    } catch (error) {
      setListError(error.message || "Unable to load your documents.");
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDocuments();
  }, [refreshDocuments]);

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

    try {
      await uploadDocument(file, (percent) => {
        // Keep a little room for server-side extraction and embedding.
        setUploadProgress(Math.min(percent, 95));
      });

      setUploadProgress(100);
      await refreshDocuments();
    } catch (error) {
      setUploadError(error.message || "Upload failed. Please try again.");
      // A failed processing attempt may still have created a FAILED record.
      await refreshDocuments();
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }

  async function handleRetry(id) {
    setRetryingId(id);
    setRetryErrors((current) => ({ ...current, [id]: "" }));

    try {
      await retryDocument(id);
      await refreshDocuments();
    } catch (error) {
      setRetryErrors((current) => ({
        ...current,
        [id]: error.message || "Retry failed. Please try again.",
      }));
      await refreshDocuments();
    } finally {
      setRetryingId("");
    }
  }

  const filteredDocuments = documents.filter((document) => {
    const query = search.trim().toLowerCase();
    return (
      document.title.toLowerCase().includes(query) ||
      document.filename.toLowerCase().includes(query)
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
            <span>Uploading and processing document...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="File upload progress"
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
        <p className="upload-error" role="alert">{uploadError}</p>
      )}

      {listError && (
        <div className="upload-error" role="alert">
          <p>{listError}</p>
          <button type="button" onClick={refreshDocuments}>
            Retry loading documents
          </button>
        </div>
      )}

      {listLoading && (
        <p role="status">Loading your documents...</p>
      )}

      <div className="document-list">
        {filteredDocuments.map((document) => (
          <DocumentCard
            key={document.id}
            document={{
              ...document,
              error: retryErrors[document.id] || document.error,
            }}
            onRetry={handleRetry}
            retrying={retryingId === document.id}
          />
        ))}
      </div>

      {!listLoading && !listError && filteredDocuments.length === 0 && (
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
    </section>
  );
}
