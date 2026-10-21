
import { apiRequest, USE_MOCK } from "./api";

const TOKEN_KEY = "project17_auth_token";
const USER_KEY = "project17_auth_user";

// Store the JWT for the current browser session.
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const value = sessionStorage.getItem(USER_KEY);

  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function getAuthHeaders() {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

function saveAuthSession(data) {
  if (!data?.token || !data?.user) {
    throw new Error(
      "The server returned an invalid authentication response."
    );
  }

  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

  window.dispatchEvent(new Event("auth-change"));

  return data;
}

export async function register({ name, email, password }) {
  if (USE_MOCK) {
    return saveAuthSession({
      token: "mock_jwt_token_" + Date.now(),
      user: {
        id: "student_user",
        name: name || "Alex Rivera",
        email: email || "student@researchspace.internal",
      },
    });
  }

  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

  return saveAuthSession(data);
}

export async function login({ email, password }) {
  if (USE_MOCK) {
    return saveAuthSession({
      token: "mock_jwt_token_" + Date.now(),
      user: {
        id: "student_user",
        name: "Alex Rivera",
        email: email || "student@researchspace.internal",
      },
    });
  }

  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return saveAuthSession(data);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);

  window.dispatchEvent(new Event("auth-change"));
}

export function isAuthenticated() {
  return Boolean(getToken());
}
export async function getCurrentUser() {
  if (!getToken()) {
    return null;
  }

  if (USE_MOCK || getToken()?.startsWith("mock_jwt_token")) {
    const stored = getStoredUser();
    if (stored) return stored;
    return {
      id: "student_user",
      name: "Alex Rivera",
      email: "student@researchspace.internal",
    };
  }

  try {
    const data = await apiRequest("/api/auth/me", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!data?.user) {
      throw new Error(
        "The server returned an invalid session response."
      );
    }

    sessionStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user)
    );

    window.dispatchEvent(new Event("auth-change"));

    return data.user;
  } catch (error) {
    if (error?.status === 401) {
      logout();
      return null;
    }

    throw error;
  }
}