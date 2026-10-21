
import React, { useState } from "react";
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
import { register, login } from "./services/authApi";
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

// Login page connected to the backend
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
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
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {message && (
          <p role="alert" className="auth-message">
            {message}
          </p>
        )}

        <button
          type="submit"
          className="primary-button full-width"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
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

// Registration page connected to the backend
function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      await register({ name, email, password });

      setSuccess(true);
      setMessage("Registration successful! Your account is ready.");
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="brand-icon auth-logo">R</div>

        <h1>Create your account</h1>
        <p>Join your research workspace.</p>

        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />

        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />

        {message && (
          <p
            role={success ? "status" : "alert"}
            className="auth-message"
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          className="primary-button full-width"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        {success && (
          <p className="auth-switch">
            <Link to="/dashboard">Open your workspace</Link>
          </p>
        )}

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

// Placeholder for pages being developed by other team members

function PlaceholderPage({ title, description }) {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  function handleAdd(event) {
    event.preventDefault();
    const value = input.trim();
    if (!value) return;

    setItems((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: value,
      },
    ]);

    setInput("");
  }

  const isChat = title === "Research Chat";
  const isEvidence = title === "Evidence Board";
  const isCompare = title === "Study Comparison";
  const isNotes = title === "Private Notes";

  return (
    <section className="content-card workspace-tool">
      <p className="eyebrow">PROJECT 17 WORKSPACE</p>
      <h2>{title}</h2>
      <p>{description}</p>

      {isChat && (
        <>
          <div className="workspace-panel">
            {answer ? (
              <p>{answer}</p>
            ) : (
              <p>
                Ask a research question. AI integration is the next step.
              </p>
            )}
          </div>

          <form onSubmit={(event) => {
            event.preventDefault();
            if (!input.trim()) return;
            setAnswer(
              "Your question: " + input.trim() +
              ". Connect the evidence-agent API to generate a research answer with citations."
            );
            setInput("");
          }}>
            <label htmlFor="research-question">Your question</label>
            <textarea
              id="research-question"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your research..."
              rows={3}
              required
            />
            <button className="primary-button" type="submit">
              Submit question
            </button>
          </form>
        </>
      )}

      {(isEvidence || isNotes || isCompare) && (
        <>
          <form onSubmit={handleAdd} className="workspace-form">
            <label htmlFor="workspace-entry">
              {isEvidence
                ? "Evidence statement"
                : isNotes
                  ? "Research note"
                  : "Study details"}
            </label>

            <textarea
              id="workspace-entry"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={
                isEvidence
                  ? "Record a finding or supporting evidence..."
                  : isNotes
                    ? "Write your research notes..."
                    : "Enter a study title, method, or finding..."
              }
              rows={3}
              required
            />

            <button className="primary-button" type="submit">
              {isEvidence
                ? "Add evidence"
                : isNotes
                  ? "Save note"
                  : "Add study"}
            </button>
          </form>

          <div className="workspace-entries">
            <h3>
              {isEvidence
                ? "Evidence entries"
                : isNotes
                  ? "Your notes"
                  : "Studies to compare"}
            </h3>

            {items.length === 0 ? (
              <p>Your entries will appear here.</p>
            ) : (
              items.map((item, index) => (
                <article className="workspace-panel" key={item.id}>
                  <p>{isCompare ? `Study ${index + 1}` : `Entry ${index + 1}`}</p>
                  <p>{item.text}</p>
                  <button
                    type="button"
                    onClick={() =>
                      setItems((previous) =>
                        previous.filter((entry) => entry.id !== item.id)
                      )
                    }
                  >
                    Remove
                  </button>
                </article>
              ))
            )}

            {isCompare && items.length >= 2 && (
              <p>
                Both study entries are available above for side-by-side review.
              </p>
            )}
          </div>
        </>
      )}
    </section>
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
        <Route element={<AppLayout />}>
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
