import { useState } from "react";

export default function NoteList({
  notes = [],
  selectedNoteId = null,
  onSelectNote,
  onNewNote,
  onDeleteNote,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      note.title?.toLowerCase().includes(q) ||
      note.content?.toLowerCase().includes(q) ||
      note.documentTitle?.toLowerCase().includes(q) ||
      (Array.isArray(note.tags) && note.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  function handleDeleteClick(e, noteId) {
    e.stopPropagation();
    setConfirmDeleteId(noteId);
  }

  function handleConfirmDelete(e, noteId) {
    e.stopPropagation();
    onDeleteNote(noteId);
    setConfirmDeleteId(null);
  }

  function handleCancelDelete(e) {
    e.stopPropagation();
    setConfirmDeleteId(null);
  }

  return (
    <div className="notes-list-pane" aria-label="Notes Directory">
      <div className="notes-list-header">
        <div className="notes-list-title-row">
          <h3>Your Notes</h3>
          <button
            type="button"
            className="primary-button btn-small"
            id="create-new-note-btn"
            onClick={onNewNote}
          >
            + New Note
          </button>
        </div>

        <div className="notes-search-box">
          <span aria-hidden="true">🔍</span>
          <input
            id="notes-search-input"
            type="search"
            placeholder="Search notes by title, tag, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search private notes"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="notes-list-body">
        {notes.length === 0 ? (
          <div className="notes-empty-state">
            <span className="empty-icon" aria-hidden="true">✎</span>
            <h4>No notes yet</h4>
            <p>Create your first private research note to capture ideas, critiques, and synthesis thoughts.</p>
            <button
              type="button"
              className="secondary-button btn-small"
              onClick={onNewNote}
            >
              Create a note
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="notes-empty-state">
            <h4>No matching notes</h4>
            <p>No notes matched &ldquo;{searchQuery}&rdquo;.</p>
            <button
              type="button"
              className="text-link"
              onClick={() => setSearchQuery("")}
            >
              Clear search filter
            </button>
          </div>
        ) : (
          <ul className="notes-items" role="list">
            {filteredNotes.map((note) => {
              const isSelected = note.id === selectedNoteId;
              const isConfirming = note.id === confirmDeleteId;

              return (
                <li
                  key={note.id}
                  className={`note-list-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectNote(note)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectNote(note);
                    }
                  }}
                >
                  <div className="note-item-top">
                    <span className="note-doc-badge" title={note.documentTitle}>
                      📄 {note.documentTitle || "Associated Paper"}
                    </span>
                    <span className="note-date">
                      {new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h4 className="note-item-title">{note.title}</h4>
                  <p className="note-item-snippet">{note.content}</p>

                  {Array.isArray(note.tags) && note.tags.length > 0 && (
                    <div className="note-tags">
                      {note.tags.map((tag) => (
                        <span key={tag} className="note-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="note-item-actions">
                    {isConfirming ? (
                      <div className="delete-confirm-box" onClick={(e) => e.stopPropagation()}>
                        <span className="confirm-prompt">Delete note?</span>
                        <button
                          type="button"
                          className="danger-button btn-xs"
                          id={`confirm-delete-btn-${note.id}`}
                          onClick={(e) => handleConfirmDelete(e, note.id)}
                        >
                          Yes, Delete
                        </button>
                        <button
                          type="button"
                          className="secondary-button btn-xs"
                          onClick={handleCancelDelete}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="delete-note-btn"
                        id={`delete-note-btn-${note.id}`}
                        onClick={(e) => handleDeleteClick(e, note.id)}
                        title="Delete this note"
                        aria-label={`Delete note: ${note.title}`}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
