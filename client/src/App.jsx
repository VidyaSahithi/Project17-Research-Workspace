
import {
  login,
  register,
  isAuthenticated,
} from "./services/authApi";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
} from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import Documents from "./pages/Documents";
import "./App.css";


// Dashboard page
function Dashboard() {
  return (
    <div>
      <div className="welcome-banner">
        <p className="eyebrow">YOUR RESEARCH WORKSPACE</p>
        <h2>Welcome to ResearchSpace</h2>
        <p>
          Organize research papers, explore evidence, and manage
          your reading in one place.
        </p>

        <Link to="/documents" className="primary-button">
          Explore documents →
        </Link>
      </div>

      <h2 className="section-title">Workspace overview</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Research papers</span>
          <strong>0</strong>
          <small>Documents in your library</small>
        </div>

        <div className="stat-card">
          <span>Collections</span>
          <strong>0</strong>
          <small>Organized research groups</small>
        </div>

        <div className="stat-card">
          <span>Ready to read</span>
          <strong>0</strong>
          <small>Processed documents</small>
        </div>
      </div>

      <div className="content-card">
        <h3>Getting started</h3>
        <p>
          Upload a research paper to begin building your
          personal research library.
        </p>

        <Link to="/documents" className="text-link">
          Go to Document Library →
        </Link>
      </div>
    </div>
  );
}

// Collections page
function Collections() {
  return (
    <div className="content-card">
      <h2>Collections</h2>
      <p>Group and organize your research papers.</p>

      <div className="empty-state">
        <h3>No collections yet</h3>
        <p>Your research collections will appear here.</p>
      </div>
    </div>
  );
}




 // Login page
function Login() {
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Login failed. Please try again.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-icon auth-logo">R</div>

        <h1>Welcome back</h1>
        <p>Sign in to your research workspace.</p>

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="primary-button full-width"
        >
          Sign in
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>

        <p>
          <Link to="/dashboard">Return to dashboard</Link>
        </p>
      </form>
    </div>
  );
}


 // Registration page
function Register() {
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      await register({ name, email, password });
      navigate("/dashboard");
    } catch (error) {
      alert(error.message || "Registration failed. Please try again.");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-icon auth-logo">R</div>

        <h1>Create your account</h1>
        <p>Start organizing your research.</p>

        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          minLength={8}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          className="primary-button full-width"
        >
          Create account
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}


// Placeholder for pages being developed by other team members
function PlaceholderPage({ title, description }) {
  return (
    <div className="content-card">
      <p className="eyebrow">PROJECT 17 WORKSPACE</p>
      <h2>{title}</h2>
      <p>{description}</p>

      <div className="coming-soon">
        This page is ready for integration.
      </div>
    </div>
  );
}

// 404 page
function NotFound() {
  return (
    <div className="content-card">
      <h2>Page not found</h2>
      <p>The page you requested does not exist.</p>

      <Link to="/dashboard" className="text-link">
        Return to dashboard
      </Link>
    </div>
  );
}
function RequireAuth({ children }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
// Main application and routes
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default route */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Public authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Shared application layout */}
        <Route
  element={
    <RequireAuth>
      <AppLayout />
    </RequireAuth>
  }
>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/documents"
            element={<Documents />}
          />

          <Route
            path="/collections"
            element={<Collections />}
          />

          {/* M6 - Research Chat */}
          <Route
            path="/chat"
            element={
              <PlaceholderPage
                title="Research Chat"
                description="Chat with your research documents."
              />
            }
          />

          {/* M7 - Evidence Board */}
          <Route
            path="/evidence"
            element={
              <PlaceholderPage
                title="Evidence Board"
                description="Collect evidence and organize reviewer comments."
              />
            }
          />

          {/* M8 - Study Comparison */}
          <Route
            path="/compare"
            element={
              <PlaceholderPage
                title="Study Comparison"
                description="Compare research studies and their findings."
              />
            }
          />

          {/* M8 - Private Notes */}
          <Route
            path="/notes"
            element={
              <PlaceholderPage
                title="Private Notes"
                description="Keep notes about your research."
              />
            }
          />
        </Route>

        {/* Unknown routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
