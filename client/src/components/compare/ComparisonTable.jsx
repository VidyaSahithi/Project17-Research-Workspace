const NOT_FOUND_TEXT = "Not found in the paper";

function renderFieldContent(value, isPage = false) {
  if (value === null || value === undefined || value === "") {
    return <span className="not-found-text">{NOT_FOUND_TEXT}</span>;
  }

  if (typeof value === "string" && value.trim().toLowerCase() === "not found in the paper") {
    return <span className="not-found-text">{NOT_FOUND_TEXT}</span>;
  }

  if (isPage) {
    return (
      <span className="source-page-badge" title={`Verified on page ${value}`}>
        📄 Page {value}
      </span>
    );
  }

  return <span className="field-content-text">{value}</span>;
}

export default function ComparisonTable({ studies = [], onRemoveStudy }) {
  if (!studies || studies.length < 2) {
    return (
      <div className="comparison-insufficient" role="status">
        <div className="insufficient-icon" aria-hidden="true">⇄</div>
        <h3>Select At Least Two Studies</h3>
        <p>
          You currently have {studies?.length || 0} study selected. To generate a side-by-side comparison, select at least two studies from the picker above.
        </p>
      </div>
    );
  }

  const comparisonRows = [
    {
      id: "researchQuestion",
      label: "Research Question",
      icon: "❓",
      getValue: (s) => s.researchQuestion,
    },
    {
      id: "researchMethod",
      label: "Research Method",
      icon: "🔬",
      getValue: (s) => s.researchMethod,
    },
    {
      id: "sampleOrData",
      label: "Sample / Data",
      icon: "📊",
      getValue: (s) => s.sampleOrData,
    },
    {
      id: "findings",
      label: "Findings",
      icon: "💡",
      getValue: (s) => s.findings,
    },
    {
      id: "limitations",
      label: "Limitations",
      icon: "⚠️",
      getValue: (s) => s.limitations,
    },
    {
      id: "sourcePage",
      label: "Source Page",
      icon: "📄",
      isPage: true,
      getValue: (s) => s.sourcePage,
    },
  ];

  return (
    <section className="comparison-table-wrapper" aria-label="Side-by-side Study Comparison">
      <div className="table-responsive-container">
        <table className="comparison-table" id="studies-comparison-table">
          <thead>
            <tr>
              <th scope="col" className="col-attribute-header">
                <span className="attribute-title">Comparison Dimension</span>
                <span className="attribute-sub">{studies.length} studies aligned</span>
              </th>
              {studies.map((study) => (
                <th key={study.id} scope="col" className="col-study-header">
                  <div className="study-header-card">
                    <div className="study-header-top">
                      <span className="study-tag">{study.filename || "Paper"}</span>
                      {onRemoveStudy && (
                        <button
                          type="button"
                          className="remove-column-btn"
                          onClick={() => onRemoveStudy(study.id)}
                          title={`Remove ${study.title} from comparison`}
                          aria-label={`Remove ${study.title} from comparison`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <h4 className="study-header-title" title={study.title}>
                      {study.title}
                    </h4>
                    {study.authors && (
                      <p className="study-header-authors">
                        {study.authors} {study.year ? `(${study.year})` : ""}
                      </p>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.id} className={`comparison-row row-${row.id}`}>
                <th scope="row" className="row-label-cell">
                  <div className="label-content">
                    <span className="row-icon" aria-hidden="true">{row.icon}</span>
                    <span className="row-label-text">{row.label}</span>
                  </div>
                </th>
                {studies.map((study) => {
                  const val = row.getValue(study);
                  return (
                    <td key={`${study.id}-${row.id}`} className="comparison-cell">
                      {renderFieldContent(val, row.isPage)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
