import { apiRequest, USE_MOCK } from "./api";
import { getAuthHeaders } from "./authApi";
import { fetchMockStudies, setSimulatedCompareFailure } from "../mocks/compareMock";

/**
 * Compare API Service (M8).
 * Provides access to study metadata and structured evidence comparison data.
 */

export { setSimulatedCompareFailure };

/**
 * Fetch studies available for comparison from the user's research documents.
 * In mock mode: returns structured mock studies.
 * In live mode: queries the evidence/documents endpoints.
 */
export async function getStudiesForComparison() {
  if (USE_MOCK) {
    return fetchMockStudies();
  }

  // 1. Try dedicated evidence comparison endpoint if available
  try {
    const data = await apiRequest("/api/evidence/compare", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (data && Array.isArray(data.studies) && data.studies.length > 0) {
      return data.studies;
    }
  } catch (err) {
    // If not implemented (404), fall back to existing /api/documents
    if (err.status !== 404) {
      throw err;
    }
  }

  // 2. Connect to existing real /api/documents from M2/M3
  try {
    const docData = await apiRequest("/api/documents", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    const docs = Array.isArray(docData?.documents) ? docData.documents : [];
    if (docs.length > 0) {
      return docs.map((doc, idx) => ({
        id: String(doc.documentId || doc._id || `doc-${idx}`),
        documentId: String(doc.documentId || doc._id),
        title: doc.title?.replace(/\.(pdf|txt)$/i, "") || "Untitled Study",
        filename: doc.title || "document.pdf",
        authors: "Authors not specified",
        researchQuestion: "Not found in the paper",
        researchMethod: "Not found in the paper",
        sampleOrData: "Not found in the paper",
        findings: "Not found in the paper",
        limitations: "Not found in the paper",
        sourcePage: doc.chunks?.[0]?.page || null,
      }));
    }
  } catch (docErr) {
    console.warn("Could not fetch real documents, using fallback mock studies:", docErr);
  }

  // Fallback to mock studies if no remote documents are ready yet
  return fetchMockStudies();
}

/**
 * Fetch comparison details for specific study IDs.
 * @param {string[]} studyIds
 */
export async function compareStudies(studyIds = []) {
  if (USE_MOCK) {
    const all = await fetchMockStudies();
    if (!studyIds.length) return all;
    return all.filter((s) => studyIds.includes(s.id));
  }

  const queryParam = studyIds.map((id) => encodeURIComponent(id)).join(",");
  const data = await apiRequest(`/api/evidence/compare?ids=${queryParam}`, {
    method: "GET",
    headers: getAuthHeaders(),
    cache: "no-store",
  });

  return data.studies || [];
}
