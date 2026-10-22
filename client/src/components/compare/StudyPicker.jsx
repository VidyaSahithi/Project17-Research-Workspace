import { useState } from "react";

export default function StudyPicker({
  studies = [],
  selectedIds = [],
  onToggleStudy,
  onSelectAll,
  onClearAll,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudies = studies.filter((study) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      study.title?.toLowerCase().includes(q) ||
      study.authors?.toLowerCase().includes(q) ||
      study.researchQuestion?.toLowerCase().includes(q) ||
      study.filename?.toLowerCase().includes(q)
    );
  });

  return (
    <section className="study-picker-card" aria-label="Study Selection">
      <div className="picker-header">
        <div>
          <h3>Select Studies to Compare</h3>
          <p className="picker-subtitle">
            Choose two or more research documents from your library to examine their methodologies, findings, and evidence side by side.
          </p>
        </div>
        <div className="picker-stats">
          <span
            className={`selection-badge ${selectedIds.length >= 2 ? "badge-ready" : "badge-pending"}`}
            id="comparison-count-badge"
          >
            {selectedIds.length} of {studies.length} selected
            {selectedIds.length < 2 && " (minimum 2 needed)"}
          </span>
        </div>
      </div>

      <div className="picker-toolbar">
        <div className="picker-search">
          <span aria-hidden="true">🔍</span>
          <input
            id="study-search-input"
            type="search"
            placeholder="Search studies by title, author, or question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search studies for comparison"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search input"
            >
              ×
            </button>
          )}
        </div>

        <div className="picker-actions">
          <button
            type="button"
            className="secondary-button btn-small"
            id="select-all-studies-btn"
            onClick={onSelectAll}
            disabled={studies.length === 0 || selectedIds.length === studies.length}
          >
            Select All
          </button>
          <button
            type="button"
            className="secondary-button btn-small"
            id="clear-all-studies-btn"
            onClick={onClearAll}
            disabled={selectedIds.length === 0}
          >
            Clear Selection
          </button>
        </div>
      </div>

      {filteredStudies.length === 0 ? (
        <div className="picker-empty-results">
          <p>No studies match &ldquo;{searchQuery}&rdquo;.</p>
          <button
            type="button"
            className="text-link"
            onClick={() => setSearchQuery("")}
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="studies-grid" role="group" aria-label="Available research papers">
          {filteredStudies.map((study) => {
            const isSelected = selectedIds.includes(study.id);
            return (
              <label
                key={study.id}
                htmlFor={`study-checkbox-${study.id}`}
                className={`study-card-item ${isSelected ? "selected" : ""}`}
              >
                <div className="study-card-header">
                  <input
                    id={`study-checkbox-${study.id}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleStudy(study.id)}
                    className="study-checkbox"
                    aria-label={`Select ${study.title}`}
                  />
                  <div className="study-card-meta">
                    <span className="study-file-tag">{study.filename || "PDF"}</span>
                    {study.year && <span className="study-year-tag">{study.year}</span>}
                  </div>
                </div>

                <div className="study-card-body">
                  <h4 className="study-card-title">{study.title}</h4>
                  {study.authors && (
                    <p className="study-card-authors">{study.authors}</p>
                  )}
                  {study.researchQuestion && (
                    <p className="study-card-question-preview">
                      <strong>RQ:</strong> {study.researchQuestion}
                    </p>
                  )}
                </div>

                <div className="study-card-footer">
                  <span className="study-source-preview">
                    {study.sourcePage ? `Source Page: ${study.sourcePage}` : "No page cited"}
                  </span>
                  <span className={`select-indicator ${isSelected ? "active" : ""}`}>
                    {isSelected ? "Selected ✓" : "+ Add to compare"}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
