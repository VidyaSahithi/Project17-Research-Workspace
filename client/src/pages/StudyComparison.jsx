import { useEffect, useState } from "react";
import {
  getStudiesForComparison,
  setSimulatedCompareFailure,
} from "../services/compareApi";
import { USE_MOCK } from "../services/api";
import StudyPicker from "../components/compare/StudyPicker";
import ComparisonTable from "../components/compare/ComparisonTable";
import "./StudyComparison.css";

export default function StudyComparison() {
  const [studies, setStudies] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [simulateError, setSimulateError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getStudiesForComparison()
      .then((data) => {
        if (!active) return;
        setStudies(data);
        setSelectedIds((current) => {
          if (current.length >= 2) return current;
          if (data.length >= 2) return [data[0].id, data[1].id];
          return data.map((d) => d.id);
        });
        setError("");
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message || "Failed to load research studies for comparison."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  function handleRetry() {
    setLoading(true);
    setError("");
    setReloadKey((k) => k + 1);
  }

  function handleToggleStudy(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedIds(studies.map((s) => s.id));
  }

  function handleClearAll() {
    setSelectedIds([]);
  }

  function handleRemoveStudy(id) {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  }

  function handleToggleSimulateError() {
    const nextVal = !simulateError;
    setSimulateError(nextVal);
    setSimulatedCompareFailure(nextVal);
  }

  const selectedStudies = studies.filter((study) =>
    selectedIds.includes(study.id)
  );

  return (
    <div className="compare-page">
      <header className="compare-header">
        <div>
          <p className="eyebrow">M8 FEATURE — SYNTHESIS & ANALYSIS</p>
          <h2>Study Comparison</h2>
          <p>
            Perform comparative analysis across multiple research papers in your library.
            Evaluate research questions, methodologies, samples, findings, and limitations
            side by side with direct source page citations.
          </p>
        </div>

        <div className="header-badges">
          <span
            className={`status-badge ${USE_MOCK ? "mock-badge" : "live-badge"}`}
            id="comparison-env-badge"
          >
            {USE_MOCK ? "Mock Mode Active" : "Live API Connected"}
          </span>
        </div>
      </header>

      {/* Error state with Retry action */}
      {error && (
        <div className="error-banner" role="alert" id="compare-error-banner">
          <div className="error-banner-text">
            <h4>Unable to load comparison data</h4>
            <p>{error}</p>
          </div>
          <button
            type="button"
            className="retry-button"
            id="compare-retry-btn"
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
          <p>Loading studies and structured evidence...</p>
        </div>
      ) : (
        <>
          {/* Study Picker and Search */}
          <StudyPicker
            studies={studies}
            selectedIds={selectedIds}
            onToggleStudy={handleToggleStudy}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />

          {/* Side by side comparison table */}
          <ComparisonTable
            studies={selectedStudies}
            onRemoveStudy={handleRemoveStudy}
          />
        </>
      )}

      {/* QA Test Controls for demonstrating retry & failure states */}
      <footer className="qa-test-controls">
        <span>
          <strong>QA Automation Helper:</strong> Test simulated network failure and retry behavior.
        </span>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            id="qa-simulate-compare-error-checkbox"
            checked={simulateError}
            onChange={handleToggleSimulateError}
          />
          Simulate next request failure
        </label>
      </footer>
    </div>
  );
}
