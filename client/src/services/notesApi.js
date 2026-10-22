import { apiRequest, USE_MOCK, ApiError } from "./api";
import { getAuthHeaders, getStoredUser } from "./authApi";
import {
  fetchMockNotes,
  createMockNote,
  updateMockNote,
  deleteMockNote,
  setSimulatedNotesFailure,
} from "../mocks/notesMock";

export { setSimulatedNotesFailure };

function getActiveUserId() {
  const user = getStoredUser();
  return user?.id || user?._id || "default_user";
}

/**
 * List all private notes belonging to the authenticated user.
 */
export async function listNotes() {
  if (USE_MOCK) {
    return fetchMockNotes(getActiveUserId());
  }

  try {
    const data = await apiRequest("/api/notes", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!data || !Array.isArray(data.notes)) {
      throw new ApiError("The notes API returned an unexpected response format.", 500, data);
    }

    return data.notes;
  } catch (err) {
    if (err.status === 404) {
      // Backend /api/notes endpoint is pending; fallback gracefully to client-side scoped storage
      return fetchMockNotes(getActiveUserId());
    }
    throw err;
  }
}

/**
 * Create a new note.
 * @param {Object} note - { title, content, documentId, documentTitle, tags }
 */
export async function createNote(note) {
  if (!note?.title?.trim()) {
    throw new Error("Please provide a note title.");
  }
  if (!note?.content?.trim()) {
    throw new Error("Please enter content for the note.");
  }
  if (!note?.documentId) {
    throw new Error("Please select an associated research document.");
  }

  if (USE_MOCK) {
    return createMockNote(getActiveUserId(), note);
  }

  try {
    return await apiRequest("/api/notes", {
      method: "POST",
      headers: getAuthHeaders(),
      body: note,
    });
  } catch (err) {
    if (err.status === 404) {
      return createMockNote(getActiveUserId(), note);
    }
    throw err;
  }
}

/**
 * Update an existing note.
 * @param {string} noteId
 * @param {Object} updates
 */
export async function updateNote(noteId, updates) {
  if (!noteId) {
    throw new Error("A note ID is required to update.");
  }

  if (updates.title !== undefined && !updates.title.trim()) {
    throw new Error("Note title cannot be empty.");
  }
  if (updates.content !== undefined && !updates.content.trim()) {
    throw new Error("Note content cannot be empty.");
  }

  if (USE_MOCK) {
    return updateMockNote(getActiveUserId(), noteId, updates);
  }

  try {
    return await apiRequest(`/api/notes/${encodeURIComponent(noteId)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: updates,
    });
  } catch (err) {
    if (err.status === 404) {
      return updateMockNote(getActiveUserId(), noteId, updates);
    }
    throw err;
  }
}

/**
 * Delete a note.
 * @param {string} noteId
 */
export async function deleteNote(noteId) {
  if (!noteId) {
    throw new Error("A note ID is required to delete.");
  }

  if (USE_MOCK) {
    return deleteMockNote(getActiveUserId(), noteId);
  }

  try {
    return await apiRequest(`/api/notes/${encodeURIComponent(noteId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
  } catch (err) {
    if (err.status === 404) {
      return deleteMockNote(getActiveUserId(), noteId);
    }
    throw err;
  }
}
