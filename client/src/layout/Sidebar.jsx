
import { NavLink } from "react-router-dom";

const navigation = [
  { path: "/dashboard", label: "Dashboard", icon: "⌂" },
  { path: "/documents", label: "Document Library", icon: "▤" },
  { path: "/collections", label: "Collections", icon: "▣" },
  { path: "/chat", label: "Research Chat", icon: "◉" },
  { path: "/evidence", label: "Evidence Board", icon: "◇" },
  { path: "/compare", label: "Study Comparison", icon: "⇄" },
  { path: "/notes", label: "Private Notes", icon: "✎" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">R</div>
        <div>
          <h2>ResearchSpace</h2>
          <span>Reading & Evidence</span>
        </div>
      </div>

      <p className="nav-heading">WORKSPACE</p>

      <nav className="side-nav">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="status-dot" />
        Workspace ready
      </div>
    </aside>
  );
}
