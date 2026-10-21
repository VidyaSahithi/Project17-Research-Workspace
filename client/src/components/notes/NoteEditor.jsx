import { useState } from "react";

export default function NoteEditor({
  note = null,
  availableDocuments = [],
  onSave,
  onCancel,
  saving = false,
  saveError = "",
  saveSuccess = false,
  onRetrySave,
}) {
  const [title, setTitle] = useState(() => note?.title || "");
  const [documentId, setDocumentId] = useState(
    () =>
      note?.documentId ||
      availableDocuments[0]?.id ||
      availableDocuments[0]?.documentId ||
      availableDocuments[0]?._id ||
      ""
  );
  const [content, setContent] = useState(() => note?.content || "");
  const [tagsInput, setTagsInput] = useState(() =>
    Array.isArray(note?.tags) ? note.tags.join(", ") : ""
  );
  const [validationErrors, setValidationErrors] = useState({});

  function validate() {
    const errors = {};
    if (!title.trim()) {
      errors.title = "Note title is required.";
    }
    if (!documentId) {
      errors.documentId = "Please select an associated research paper.";
    }
    if (!content.trim()) {
      errors.content = "Note content cannot be empty.";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const selectedDoc = availableDocuments.find(
      (d) => (d.id || d.documentId || d._id) === documentId
    );

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim().replace(/^#/, ""))
      .filter(Boolean);

    const notePayload = {
      title: title.trim(),
      documentId,
      documentTitle: selectedDoc?.title || selectedDoc?.filename || "Research Document",
      content: content.trim(),
      tags: parsedTags,
    };

    onSave(notePayload);
  }

  const isEditing = Boolean(note?.id);

  return (
    <div className="note-editor-pane" aria-label="Note Editor">
      <form onSubmit={handleSubmit} className="note-editor-form">
        <div className="note-editor-header">
          <div>
            <h3>{isEditing ? "Edit Research Note" : "Create New Private Note"}</h3>
            <p className="editor-subtext">
              {isEditing
                ? `Last modified: ${note.updatedAt ? new Date(note.updatedAt).toLocaleString() : "Recently"}`
                : "Record your research observations, thesis links, and critiques."}
            </p>
          </div>

          <div className="editor-header-actions">
            {onCancel && (
              <button
                type="button"
                className="secondary-button"
                onClick={onCancel}
                disabled={saving}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="primary-button"
              id="save-note-btn"
              disabled={saving}
            >
              {saving ? "Saving note..." : isEditing ? "Save Changes" : "Create Note"}
            </button>
          </div>
        </div>

        {/* Saved confirmation feedback */}
        {saveSuccess && (
          <div className="success-banner" role="status" id="note-saved-success-banner">
            <span aria-hidden="true">✓</span>
            <span>Note saved successfully!</span>
          </div>
        )}

        {/* Error banner with Retry */}
        {saveError && (
          <div className="error-banner" role="alert" id="note-save-error-banner">
            <div className="error-banner-text">
              <h4>Save Failed</h4>
              <p>{saveError}</p>
            </div>
            {onRetrySave && (
              <button
                type="button"
                className="retry-button"
                id="note-retry-save-btn"
                onClick={onRetrySave}
              >
                Retry Save
              </button>
            )}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="note-title-input">
            Note Title <span className="required-star">*</span>
          </label>
          <input
            id="note-title-input"
            type="text"
            placeholder="e.g. Methodology Critique: Scanner Heterogeneity"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationErrors.title) {
                setValidationErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            aria-invalid={Boolean(validationErrors.title)}
            aria-describedby={validationErrors.title ? "note-title-error" : undefined}
          />
          {validationErrors.title && (
            <p className="validation-error-msg" id="note-title-error" role="alert">
              {validationErrors.title}
            </p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label htmlFor="note-document-select">
              Associated Research Paper <span className="required-star">*</span>
            </label>
            <select
              id="note-document-select"
              value={documentId}
              onChange={(e) => {
                setDocumentId(e.target.value);
                if (validationErrors.documentId) {
                  setValidationErrors((prev) => ({ ...prev, documentId: undefined }));
                }
              }}
              aria-invalid={Boolean(validationErrors.documentId)}
              aria-describedby={validationErrors.documentId ? "note-doc-error" : undefined}
            >
              <option value="">-- Select a document --</option>
              {availableDocuments.map((doc) => {
                const id = doc.id || doc.documentId || doc._id;
                return (
                  <option key={id} value={id}>
                    {doc.title || doc.filename || "Untitled Paper"}
                  </option>
                );
              })}
            </select>
            {validationErrors.documentId && (
              <p className="validation-error-msg" id="note-doc-error" role="alert">
                {validationErrors.documentId}
              </p>
            )}
          </div>

          <div className="form-group flex-1">
            <label htmlFor="note-tags-input">
              Tags <span className="optional-tag">(comma-separated)</span>
            </label>
            <input
              id="note-tags-input"
              type="text"
              placeholder="e.g. methodology, thesis-ch2, sample-size"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <div className="label-with-meta">
            <label htmlFor="note-content-textarea">
              Note Content <span className="required-star">*</span>
            </label>
            <span className="char-count">{content.length} characters</span>
          </div>
          <textarea
            id="note-content-textarea"
            rows={10}
            placeholder="Write your research notes, critiques, connections to other literature, or future experiment ideas..."
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (validationErrors.content) {
                setValidationErrors((prev) => ({ ...prev, content: undefined }));
              }
            }}
            aria-invalid={Boolean(validationErrors.content)}
            aria-describedby={validationErrors.content ? "note-content-error" : undefined}
          />
          {validationErrors.content && (
            <p className="validation-error-msg" id="note-content-error" role="alert">
              {validationErrors.content}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
