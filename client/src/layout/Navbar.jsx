
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getStoredUser,
  getToken,
  logout,
} from "../services/authApi";

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

  const [user, setUser] = useState(() =>
    getToken() ? getStoredUser() : null
  );

  const pageName = pageNames[location.pathname] || "Workspace";
  const displayName = user?.name || user?.email || "User";
  const initial = displayName.trim().charAt(0).toUpperCase() || "U";

  function handleAuthClick() {
    if (user) {
      logout();
      setUser(null);
    }

    navigate("/login");
  }

  return (
    <header className="navbar">
      <div>
        <p className="breadcrumb">Workspace / {pageName}</p>
        <h1>{pageName}</h1>
      </div>

      <div className="navbar-actions">
        <span className="user-avatar" title={displayName}>
          {initial}
        </span>

        <button
          className="logout-button"
          onClick={handleAuthClick}
        >
          {user ? "Sign out" : "Sign in"}
        </button>
      </div>
    </header>
  );
}
