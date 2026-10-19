
import { useLocation, useNavigate } from "react-router-dom";

const pageNames = {
  "/dashboard": "Dashboard",
  "/documents": "Document Library",
  "/collections": "Collections",
  "/chat": "Research Chat",
  "/evidence": "Evidence Board",
  "/compare": "Study Comparison",
  "/notes": "Private Notes",
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageName = pageNames[location.pathname] || "Workspace";

  return (
    <header className="navbar">
      <div>
        <p className="breadcrumb">Workspace / {pageName}</p>
        <h1>{pageName}</h1>
      </div>

      <div className="navbar-actions">
        <span className="user-avatar">U</span>
        <button
          className="logout-button"
          onClick={() => navigate("/login")}
        >
          Sign in
        </button>
      </div>
    </header>
  );
}
