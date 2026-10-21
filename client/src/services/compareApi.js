import { apiRequest, USE_MOCK, ApiError } from "./api";
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

  try {
    const data = await apiRequest("/api/evidence/compare", {
      method: "GET",
      headers: getAuthHeaders(),
      cache: "no-store",
    });

    if (!data || !Array.isArray(data.studies)) {
      throw new ApiError("The comparison API returned an unexpected response format.", 500, data);
    }

    return data.studies;
  } catch (err) {
    // If backend route is not yet implemented (e.g. 404), return clear error
    if (err.status === 404) {
      throw new ApiError(
        "Study Comparison API (/api/evidence/compare) is not yet available on the backend server. Enable mock mode in client/.env with VITE_USE_MOCK=true.",
        404
      );
    }
    throw err;
  }
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
