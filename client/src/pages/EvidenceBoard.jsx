
import { useState } from "react";
import "./EvidenceBoard.css";

const initialEvidence = [
  {
    id: 1,
    claim: "Study design and methodology",
    source: "Research Paper 1",
    detail:
      "Review the study design, sample size, and methodology before accepting the findings.",
    status: "Pending",
    comment: "",
  },
  {
    id: 2,
    claim: "Key research findings",
    source: "Research Paper 2",
    detail:
      "Check whether the reported results support the authors' conclusions.",
    status: "Pending",
    comment: "",
  },
  {
    id: 3,
    claim: "Limitations and potential bias",
    source: "Research Paper 3",
    detail:
      "Identify limitations, possible bias, and areas requiring further investigation.",
    status: "Pending",
    comment: "",
  },
];

export default function EvidenceBoard() {
  const [evidence, setEvidence] = useState(() => {
    try {
      const stored = localStorage.getItem("project17-evidence");
      return stored ? JSON.parse(stored) : initialEvidence;
    } catch {
      return initialEvidence;
    }
  });

  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClaim, setNewClaim] = useState("");
  const [newSource, setNewSource] = useState("");
  const [newDetail, setNewDetail] = useState("");

  function updateEvidence(id, updates) {
    setEvidence((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
    setSaved(false);
  }

  function addEvidence(event) {
    event.preventDefault();

    if (!newClaim.trim() || !newSource.trim()) {
      alert("Please enter a claim title and source.");
      return;
    }

    const newItem = {
      id: Date.now(),
      claim: newClaim.trim(),
      source: newSource.trim(),
      detail: newDetail.trim(),
      status: "Pending",
      comment: "",
    };

    setEvidence((current) => [...current, newItem]);
    setNewClaim("");
    setNewSource("");
    setNewDetail("");
    setShowAddForm(false);
    setSaved(false);
  }

  function saveEvidence() {
    try {
      localStorage.setItem(
        "project17-evidence",
        JSON.stringify(evidence)
      );
      setSaved(true);
    } catch {
      alert("Unable to save evidence in this browser.");
    }
  }

  function resetEvidence() {
    const confirmed = window.confirm(
      "Reset the board to its original sample evidence? This will remove your current evidence."
    );

    if (confirmed) {
      setEvidence(initialEvidence);
      setFilter("All");
      setSaved(false);
      localStorage.removeItem("project17-evidence");
    }
  }

  function removeEvidence(id) {
    setEvidence((current) =>
      current.filter((item) => item.id !== id)
    );
    setSaved(false);
  }
const reviewedCount = evidence.reduce((count, item) => {
  return count + (item.status !== "Pending" ? 1 : 0);
}, 0);


  const filteredEvidence =
    filter === "All"
      ? evidence
      : evidence.filter((item) => item.status === filter);

  return (
    <div className="evidence-page">
      <div className="evidence-header">
        <div>
          <p className="eyebrow">PROJECT 17 WORKSPACE</p>
          <h1>Evidence Board</h1>
          <p>
            Collect research evidence, review findings, and record
            reviewer comments in one place.
          </p>
        </div>

        <button
          type="button"
          className="evidence-button"
          onClick={() => setShowAddForm((current) => !current)}
        >
          {showAddForm ? "Cancel" : "+ Add evidence"}
        </button>
      </div>

      {showAddForm && (
        <form
          className="evidence-card evidence-add-form"
          onSubmit={addEvidence}
        >
          <h2>Add research evidence</h2>

          <label>
            Claim title *
            <input
              type="text"
              value={newClaim}
              onChange={(event) => setNewClaim(event.target.value)}
              placeholder="Enter the research claim"
              required
            />
          </label>

          <label>
            Source *
            <input
              type="text"
              value={newSource}
              onChange={(event) => setNewSource(event.target.value)}
              placeholder="Enter paper or source name"
              required
            />
          </label>

          <label>
            Evidence details
            <textarea
              rows={3}
              value={newDetail}
              onChange={(event) => setNewDetail(event.target.value)}
              placeholder="Describe the evidence"
            />
          </label>

          <button className="evidence-save" type="submit">
            Add to board
          </button>
        </form>
      )}

      <div className="evidence-progress">
        <div>
          <span>Total evidence</span>
          <strong>{evidence.length}</strong>
        </div>

        <div>
          <span>Reviewed</span>
          <strong>{reviewedCount}</strong>
        </div>

        <div>
          <span>Pending review</span>
          <strong>{evidence.length - reviewedCount}</strong>
        </div>
      </div>

      <div className="evidence-summary">
        <div>
          <h2>Research evidence</h2>
          <p>Review each claim and add your comments.</p>
        </div>

        <label>
          Filter:
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="All">All evidence</option>
            <option value="Pending">Pending</option>
            <option value="Supported">Supported</option>
            <option value="Needs review">Needs review</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
      </div>

      <div className="evidence-list">
        {filteredEvidence.map((item) => (
          <article className="evidence-card" key={item.id}>
            <div className="evidence-card-header">
              <span className="evidence-source">
                {item.source}
              </span>

              <span className="evidence-status">
                {item.status}
              </span>
            </div>

            <label>
              Claim title
              <input
                type="text"
                value={item.claim}
                onChange={(event) =>
                  updateEvidence(item.id, {
                    claim: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Source
              <input
                type="text"
                value={item.source}
                onChange={(event) =>
                  updateEvidence(item.id, {
                    source: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Evidence details
              <textarea
                rows={3}
                value={item.detail}
                onChange={(event) =>
                  updateEvidence(item.id, {
                    detail: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Reviewer comments
              <textarea
                rows={2}
                placeholder="Write your review comments..."
                value={item.comment}
                onChange={(event) =>
                  updateEvidence(item.id, {
                    comment: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Review decision
              <select
                value={item.status}
                onChange={(event) =>
                  updateEvidence(item.id, {
                    status: event.target.value,
                  })
                }
              >
                <option value="Pending">Pending</option>
                <option value="Supported">Supported</option>
                <option value="Needs review">Needs review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </label>

            <button
              type="button"
              className="evidence-reset"
              onClick={() => removeEvidence(item.id)}
            >
              Remove evidence
            </button>
          </article>
        ))}

        {filteredEvidence.length === 0 && (
          <p>No evidence matches this filter.</p>
        )}
      </div>

      <div className="evidence-footer">
        <p>
          {saved
            ? "Your evidence has been saved in this browser."
            : "Remember to save your changes."}
        </p>

        <div>
          <button
            type="button"
            className="evidence-reset"
            onClick={resetEvidence}
          >
            Reset board
          </button>

          <button
            type="button"
            className="evidence-save"
            onClick={saveEvidence}
          >
            Save evidence
          </button>
        </div>
      </div>
    </div>
  );
}
