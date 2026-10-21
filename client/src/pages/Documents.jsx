
import { useEffect, useState } from "react";
import DocumentCard from "../components/library/DocumentCard";
import UploadButton from "../components/library/UploadButton";
import SearchBar from "../components/library/SearchBar";
import {
  listDocuments,
  uploadDocument,
  getDocumentFileUrl,
} from "../services/documentsApi";
import "./Documents.css";

const MAX_FILE_SIZE = 20 * 1024 * 1024;

function mapDocument(doc) {
  const filename = doc.filename || doc.fileName || doc.title || "document.txt";
  const rawStatus = String(doc.status || "").toUpperCase();

  let status = "processing";

  if (["COMPLETED", "READY"].includes(rawStatus)) {
    status = "ready";
  } else if (rawStatus === "FAILED") {
    status = "failed";
  }

  return {
    id: doc.id || doc.documentId || doc._id,
    title: filename.replace(/\.(pdf|txt)$/i, ""),
    filename,
    pages: null,
    size: doc.size || null,
    status,
    serverBacked: true,
  };
}

export default function Documents() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState(null);

  async function refreshDocuments() {
    const result = await listDocuments();
    setDocuments((result.documents || []).map(mapDocument));
  }

  useEffect(() => {
    let active = true;

    async function loadDocuments() {
      try {
        const result = await listDocuments();

        if (active) {
          setDocuments((result.documents || []).map(mapDocument));
        }
      } catch (error) {
        if (active) {
          setUploadError(`Could not load documents: ${error.message}`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDocuments();

    return () => {
      active = false;
    };
  }, []);

  async function handleFileSelected(file) {
    setUploadError("");

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "txt"].includes(extension)) {
      setUploadError("Please select a PDF or TXT file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError("File exceeds the 20 MB limit.");
      return;
    }

    if (file.size === 0) {
      setUploadError("The selected file is empty.");
      return;
    }

    setUploading(true);

    try {
      const result = await uploadDocument(file);

      await refreshDocuments();

      if (String(result.status || "").toUpperCase() !== "COMPLETED") {
        setUploadError(
          "The upload request finished, but document processing is not complete."
        );
      }
    } catch (error) {
      setUploadError(`Upload failed: ${error.message}`);

      // Refresh in case the backend saved the document before processing failed.
      try {
        await refreshDocuments();
      } catch {
        // Keep the original upload error visible.
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleOpen(document) {
    setUploadError("");
    setOpeningId(document.id);

    // Open a tab directly from the user's click to reduce popup blocking.
    const tab = window.open("about:blank", "_blank");

    try {
      const url = await getDocumentFileUrl(document.id);

      if (tab && !tab.closed) {
        tab.location.href = url;
      } else {
        window.location.href = url;
      }
    } catch (error) {
      if (tab && !tab.closed) {
        tab.close();
      }

      setUploadError(`Could not open document: ${error.message}`);
    } finally {
      setOpeningId(null);
    }
  }

  function handleRetry() {
    setUploadError(
      "Retry processing is not implemented yet. Check the backend error before uploading again."
    );
  }

  const query = search.trim().toLowerCase();

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(query) ||
      doc.filename.toLowerCase().includes(query)
  );

  return (
    <section className="documents-page">
      <div className="library-heading">
        <div>
          <p className="eyebrow">YOUR RESEARCH WORKSPACE</p>
          <h2>My Research Papers</h2>
          <p>Manage, search, and open your research documents.</p>
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
        <p role="status">
          Uploading and processing document. Please wait…
        </p>
      )}

      {openingId && <p role="status">Opening document…</p>}

      {uploadError && (
        <p className="upload-error" role="alert">
          {uploadError}
        </p>
      )}

      {loading ? (
        <p>Loading your documents…</p>
      ) : (
        <>
          <div className="document-list">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onRetry={handleRetry}
                onOpen={handleOpen}
              />
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="library-empty-state">
              <h3>
                {documents.length === 0
                  ? "Your library is empty"
                  : "No matching documents"}
              </h3>

              <p>
                {documents.length === 0
                  ? "Upload a PDF or TXT file to get started."
                  : "Try a different search term."}
              </p>
            </div>
          )}
        </>
      )}
    </section>
  );
}
