
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  Outlet,
} from "react-router-dom";

import {
  login,
  register,
  isAuthenticated,
  getCurrentUser,
} from "./services/authApi";

import AppLayout from "./layout/AppLayout";
import Documents from "./pages/Documents";
import EvidenceBoard from "./pages/EvidenceBoard";
import Chat from "./pages/Chat";
import StudyComparison from "./pages/StudyComparison";
import Notes from "./pages/Notes";
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
      navigate("/dashboard", { replace: true });
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

function Register() {
  const navigate = useNavigate();
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
      setMessage(
        error.message || "Registration failed. Please try again."
      );
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
            <button
              type="button"
              className="text-link"
              onClick={() => navigate("/login")}
            >
              Continue to sign in
            </button>
          </p>
        )}

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

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

function ProtectedLayout() {
  const [status, setStatus] = useState(() =>
    isAuthenticated() ? "checking" : "signed-out"
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!isAuthenticated()) {
      return () => {
        active = false;
      };
    }

    getCurrentUser()
      .then((user) => {
        if (active) {
          setStatus(user ? "authenticated" : "signed-out");
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Unable to verify your session.");
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return <p>Checking your session...</p>;
  }

  if (status === "signed-out") {
    return <Navigate to="/login" replace />;
  }

  if (status === "error") {
    return (
      <div className="content-card" role="alert">
        <h2>Unable to verify your session</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/evidence" element={<EvidenceBoard />} />
            <Route path="/compare" element={<StudyComparison />} />
            <Route path="/notes" element={<Notes />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
