/**
 * Mock data and client-side storage for Private Notes (M8).
 * Enforces per-user privacy isolation and supports create, read, update, delete, search.
 */

const STORAGE_KEY = "project17_private_notes";

const DEFAULT_INITIAL_NOTES = {
  // Keyed by userId to enforce privacy
  default_user: [
    {
      id: "note-101",
      userId: "default_user",
      documentId: "doc-1",
      documentTitle: "AI in Healthcare.pdf",
      title: "Radiology Sensitivity Findings Reflection",
      content: "The 14.2% sensitivity improvement is impressive, but note that the dataset excludes patients with previous thoracic surgery. Need to check if this holds up in older cohorts before citing in thesis Section 3.",
      tags: ["radiology", "validation", "limitations"],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "note-102",
      userId: "default_user",
      documentId: "doc-2",
      documentTitle: "Climate Study.pdf",
      title: "Albedo versus Canopy Cooling Comparison",
      content: "High-albedo surfaces gave daytime peak drop of 1.8°C while green canopy gave 2.4°C at night. Best urban planning recommendation is combining both rather than treating them as alternatives.",
      tags: ["urban-planning", "microclimate"],
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

let simulatedNotesFailure = false;

export function setSimulatedNotesFailure(fail) {
  simulatedNotesFailure = fail;
}

function getStoredStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_INITIAL_NOTES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_INITIAL_NOTES;
  }
}

function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error("Failed to persist notes to localStorage:", err);
  }
}

/**
 * Fetch all notes owned by the authenticated user.
 */
export async function fetchMockNotes(userId = "default_user") {
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (simulatedNotesFailure) {
    throw new Error("Unable to load notes. Network or server error occurred.");
  }

  const store = getStoredStore();
  const userNotes = store[userId] || [];
  return JSON.parse(JSON.stringify(userNotes));
}

/**
 * Create a new private note for the authenticated user.
 */
export async function createMockNote(userId = "default_user", noteData) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (simulatedNotesFailure) {
    throw new Error("Failed to save note. Server temporarily unavailable.");
  }

  if (!noteData.title?.trim()) {
    throw new Error("Note title is required.");
  }

  if (!noteData.content?.trim()) {
    throw new Error("Note content cannot be empty.");
  }

  if (!noteData.documentId) {
    throw new Error("A valid research document must be associated with the note.");
  }

  const store = getStoredStore();
  if (!store[userId]) {
    store[userId] = [];
  }

  const newNote = {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId,
    documentId: noteData.documentId,
    documentTitle: noteData.documentTitle || "Associated Document",
    title: noteData.title.trim(),
    content: noteData.content.trim(),
    tags: Array.isArray(noteData.tags) ? noteData.tags : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store[userId].unshift(newNote);
  saveStore(store);

  return JSON.parse(JSON.stringify(newNote));
}

/**
 * Update an existing note owned by the authenticated user.
 */
export async function updateMockNote(userId = "default_user", noteId, updates) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (simulatedNotesFailure) {
    throw new Error("Failed to update note. Please try again.");
  }

  if (updates.title !== undefined && !updates.title.trim()) {
    throw new Error("Note title cannot be blank.");
  }

  if (updates.content !== undefined && !updates.content.trim()) {
    throw new Error("Note content cannot be blank.");
  }

  const store = getStoredStore();
  const userNotes = store[userId] || [];
  const index = userNotes.findIndex((n) => n.id === noteId);

  if (index === -1) {
    throw new Error("Note not found or unauthorized to edit.");
  }

  const updatedNote = {
    ...userNotes[index],
    ...updates,
    title: updates.title !== undefined ? updates.title.trim() : userNotes[index].title,
    content: updates.content !== undefined ? updates.content.trim() : userNotes[index].content,
    updatedAt: new Date().toISOString(),
  };

  userNotes[index] = updatedNote;
  store[userId] = userNotes;
  saveStore(store);

  return JSON.parse(JSON.stringify(updatedNote));
}

/**
 * Delete a note owned by the authenticated user.
 */
export async function deleteMockNote(userId = "default_user", noteId) {
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (simulatedNotesFailure) {
    throw new Error("Failed to delete note. Service unreachable.");
  }

  const store = getStoredStore();
  const userNotes = store[userId] || [];
  const note = userNotes.find((n) => n.id === noteId);

  if (!note) {
    throw new Error("Note not found or you lack permission to delete it.");
  }

  store[userId] = userNotes.filter((n) => n.id !== noteId);
  saveStore(store);

  return { success: true, deletedId: noteId };
}
