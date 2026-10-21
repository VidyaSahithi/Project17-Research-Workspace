import { useEffect, useState } from "react";
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
  setSimulatedNotesFailure,
} from "../services/notesApi";
import { listDocuments } from "../services/documentsApi";
import { getStoredUser } from "../services/authApi";
import { USE_MOCK } from "../services/api";
import { mockStudies } from "../mocks/compareMock";
import NoteList from "../components/notes/NoteList";
import NoteEditor from "../components/notes/NoteEditor";
import "./Notes.css";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [availableDocs, setAvailableDocs] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [lastAttemptedPayload, setLastAttemptedPayload] = useState(null);

  const [simulateFailure, setSimulateFailure] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const user = getStoredUser();
  const userName = user?.name || user?.email || "Researcher";

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const userNotes = await listNotes();
        if (!active) return;
        setNotes(userNotes);

        let docs = [];
        try {
          if (!USE_MOCK) {
            docs = await listDocuments();
          }
        } catch (docErr) {
          console.warn("Could not fetch remote documents, using fallback papers:", docErr);
        }

        if (!docs || docs.length === 0) {
          docs = mockStudies.map((s) => ({
            id: s.id,
            title: s.title,
            filename: s.filename,
          }));
        }

        if (!active) return;
        setAvailableDocs(docs);

        setSelectedNote((current) => {
          if (current && userNotes.some((n) => n.id === current.id)) {
            return current;
          }
          return userNotes[0] || null;
        });
        setPageError("");
      } catch (err) {
        if (active) {
          setPageError(err.message || "Failed to load private notes.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setPageError("");
    setReloadKey((k) => k + 1);
  }

  async function handleSaveNote(payload) {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    setLastAttemptedPayload(payload);

    try {
      if (selectedNote?.id) {
        // Update existing note
        const updated = await updateNote(selectedNote.id, payload);
        setNotes((prev) =>
          prev.map((n) => (n.id === updated.id ? updated : n))
        );
        setSelectedNote(updated);
      } else {
        // Create new note
        const created = await createNote(payload);
        setNotes((prev) => [created, ...prev]);
        setSelectedNote(created);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      setSaveError(err.message || "Failed to save note. Please retry.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteNote(noteId) {
    setPageError("");

    try {
      await deleteNote(noteId);
      const remaining = notes.filter((n) => n.id !== noteId);
      setNotes(remaining);

      if (selectedNote?.id === noteId) {
        setSelectedNote(remaining[0] || null);
      }
    } catch (err) {
      setPageError(err.message || "Failed to delete note.");
    }
  }

  function handleSelectNote(note) {
    setSelectedNote(note);
    setSaveError("");
    setSaveSuccess(false);
  }

  function handleNewNote() {
    setSelectedNote(null);
    setSaveError("");
    setSaveSuccess(false);
  }

  function handleToggleSimulateFailure() {
    const next = !simulateFailure;
    setSimulateFailure(next);
    setSimulatedNotesFailure(next);
  }

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <p className="eyebrow">M8 FEATURE — PRIVATE RESEARCH JOURNAL</p>
          <h2>Private Notes</h2>
          <p>
            Capture your private research insights, critiques, and synthesis thoughts.
            Notes are strictly private to your authenticated account and are linked directly to your research documents.
          </p>
        </div>

        <div className="header-badges">
          <span className="user-privacy-badge" id="notes-privacy-badge">
            🔒 Private to {userName}
          </span>
          <span
            className={`status-badge ${USE_MOCK ? "mock-badge" : "live-badge"}`}
            id="notes-env-badge"
          >
            {USE_MOCK ? "Mock Storage" : "Backend Scoped"}
          </span>
        </div>
      </header>

      {/* Page Error Banner */}
      {pageError && (
        <div className="error-banner" role="alert" id="notes-page-error-banner">
          <div className="error-banner-text">
            <h4>Error</h4>
            <p>{pageError}</p>
          </div>
          <button
            type="button"
            className="retry-button"
            id="notes-page-retry-btn"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="loading-container" role="status" aria-live="polite">
          <div className="loading-spinner" />
          <p>Loading your private research notes...</p>
        </div>
      ) : (
        <div className="notes-workspace-layout">
          {/* Left Pane: Notes Directory & Search */}
          <NoteList
            notes={notes}
            selectedNoteId={selectedNote?.id}
            onSelectNote={handleSelectNote}
            onNewNote={handleNewNote}
            onDeleteNote={handleDeleteNote}
          />

          {/* Right Pane: Note Editor */}
          <NoteEditor
            key={selectedNote?.id || "new-note"}
            note={selectedNote}
            availableDocuments={availableDocs}
            onSave={handleSaveNote}
            onCancel={notes.length > 0 ? () => setSelectedNote(notes[0]) : undefined}
            saving={saving}
            saveError={saveError}
            saveSuccess={saveSuccess}
            onRetrySave={
              lastAttemptedPayload ? () => handleSaveNote(lastAttemptedPayload) : undefined
            }
          />
        </div>
      )}

      {/* QA Automation helper */}
      <footer className="qa-test-controls">
        <span>
          <strong>QA Automation Helper:</strong> Simulate network/server failure to test Retry states.
        </span>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            id="qa-simulate-notes-error-checkbox"
            checked={simulateFailure}
            onChange={handleToggleSimulateFailure}
          />
          Simulate next notes operation failure
        </label>
      </footer>
    </div>
  );
}
