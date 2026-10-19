
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import AppLayout from "./layout/AppLayout";
import "./App.css";

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

function Documents() {
  return (
    <div className="content-card">
      <div className="card-heading">
        <div>
          <h2>My Research Papers</h2>
          <p>Manage and search your research documents.</p>
        </div>
        <button
          className="primary-button"
          onClick={() =>
            alert("Upload functionality will be added next.")
          }
        >
          + Upload Paper
        </button>
      </div>

      <div className="empty-state">
        <div className="empty-icon">▤</div>
        <h3>Your library is ready</h3>
        <p>
          Your documents will appear here after you upload them.
        </p>
      </div>
    </div>
  );
}

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

function Login() {
  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault();
          alert("Authentication will be connected to the backend later.");
        }}
      >
        <div className="brand-icon auth-logo">R</div>
        <h1>Welcome back</h1>
        <p>Sign in to your research workspace.</p>

        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          type="email"
          placeholder="you@example.com"
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit" className="primary-button full-width">
          Sign in
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

function Register() {
  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={(event) => {
          event.preventDefault();
          alert("Registration will be connected to the backend later.");
        }}
      >
        <div className="brand-icon auth-logo">R</div>
        <h1>Create your account</h1>
        <p>Start organizing your research.</p>

        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          placeholder="Your name"
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          type="email"
          placeholder="you@example.com"
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          minLength={8}
          placeholder="At least 8 characters"
          required
        />

        <button type="submit" className="primary-button full-width">
          Create account
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

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

function NotFound() {
  return (
    <div className="content-card">
      <h2>Page not found</h2>
      <Link to="/dashboard" className="text-link">
        Return to dashboard
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/collections" element={<Collections />} />

          <Route
            path="/chat"
            element={
              <PlaceholderPage
                title="Research Chat"
                description="Chat with your research documents."
              />
            }
          />

          <Route
            path="/evidence"
            element={
              <PlaceholderPage
                title="Evidence Board"
                description="Collect evidence and organize reviewer comments."
              />
            }
          />

          <Route
            path="/compare"
            element={
              <PlaceholderPage
                title="Study Comparison"
                description="Compare research studies and their findings."
              />
            }
          />

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

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
