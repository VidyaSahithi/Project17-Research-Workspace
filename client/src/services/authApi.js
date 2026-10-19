
import { apiRequest } from "./api";

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
    throw new Error("The server returned an invalid authentication response.");
  }

  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));

  return data;
}

export async function register({ name, email, password }) {
  const data = await apiRequest("/api/auth/register", {
    method: "POST",
    body: { name, email, password },
  });

  return saveAuthSession(data);
}

export async function login({ email, password }) {
  const data = await apiRequest("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });

  return saveAuthSession(data);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}
