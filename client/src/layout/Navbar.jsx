import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../services/authApi";

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

  const [user, setUser] = useState(() => getStoredUser());

  // Refresh the user information when the route changes.
useEffect(() => {
  const syncAuth = () => {
    setUser(getStoredUser());
  };

  window.addEventListener("auth-change", syncAuth);

  return () => {
    window.removeEventListener("auth-change", syncAuth);
  };
}, []);

  const pageName =
    pageNames[location.pathname] || "Workspace";

  function handleAuthButton() {
    if (user) {
      logout();
      setUser(null);
      navigate("/login");
    } else {
      navigate("/login");
    }
  }

  const initial = (
    user?.name?.trim()?.[0] ||
    user?.email?.trim()?.[0] ||
    "U"
  ).toUpperCase();

  return (
    <header className="navbar">
      <div>
        <p className="breadcrumb">
          Workspace / {pageName}
        </p>
        <h1>{pageName}</h1>
      </div>

      <div className="navbar-actions">
        <span className="user-avatar" title={user?.name || "Guest"}>
          {initial}
        </span>

        <button
          className="logout-button"
          onClick={handleAuthButton}
        >
          {user ? "Sign out" : "Sign in"}
        </button>
      </div>
    </header>
  );
}