/**
 * Centralized API Service for TripResQ
 *
 * Single source of truth for backend communication across the entire application:
 * - Trips & Itineraries
 * - Flight, Train, Cab, and Hotel builder nodes
 * - Locking journey
 * - Recent trips
 * - Risk Radar & Buffer Plan execution
 * - Recovery Control (options, plans, applying recovery, family fracture / cohort demo)
 * - Next Stop detection
 * - Impact Metrics & Disruption cascade
 *
 * Architecture:
 *   DB_API_URL -> vite.config.js -> src/services/api.js -> ALL frontend API calls
 */

const rawApiUrl = (import.meta.env.DB_API_URL || '').trim();

/**
 * Normalized backend root URL without trailing slash or trailing /api
 */
export const BACKEND_ROOT_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/, '');

/**
 * Normalized API base URL ending with /api, or empty string if DB_API_URL is missing
 */
export const API_BASE_URL = BACKEND_ROOT_URL ? `${BACKEND_ROOT_URL}/api` : '';

/**
 * Checks if DB_API_URL is properly configured.
 * @returns {boolean}
 */
export function isApiConfigured() {
  return Boolean(BACKEND_ROOT_URL);
}

/**
 * Returns the backend root URL.
 * @returns {string}
 */
export function getBackendRootUrl() {
  return BACKEND_ROOT_URL;
}

/**
 * Returns the API base URL.
 * @returns {string}
 */
export function getApiBaseUrl() {
  return API_BASE_URL;
}

/**
 * Centralized fetch helper for all backend requests.
 *
 * Handles:
 * - URL resolution (ensures /api prefix is correctly structured)
 * - Clear error return if DB_API_URL is missing
 * - Consistent headers (JSON content-type default for payload bodies)
 *
 * @param {string} path - Endpoint path (e.g. '/trips', '/api/trips', '/seed-demo')
 * @param {RequestInit} [options={}] - Standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  if (!BACKEND_ROOT_URL) {
    const errorMsg =
      'TripResQ API Error: DB_API_URL is not configured! ' +
      'Please configure the DB_API_URL environment variable in your Vercel project settings or local environment.';
    console.error(`[TripResQ API] Request to "${path}" blocked: ${errorMsg}`);

    return new Response(
      JSON.stringify({
        error: errorMsg,
        code: 'MISSING_DB_API_URL'
      }),
      {
        status: 503,
        statusText: 'API Configuration Error',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  let targetUrl = '';

  if (cleanPath.startsWith('/api/')) {
    targetUrl = `${BACKEND_ROOT_URL}${cleanPath}`;
  } else if (cleanPath === '/health' || cleanPath.startsWith('/health/')) {
    targetUrl = `${BACKEND_ROOT_URL}${cleanPath}`;
  } else {
    targetUrl = `${API_BASE_URL}${cleanPath}`;
  }

  const headers = {
    ...(options.headers || {})
  };

  if (options.body && typeof options.body === 'string' && !headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(targetUrl, {
    ...options,
    headers
  });
}

/**
 * Helper to fetch and parse JSON safely
 */
export async function apiFetchJson(path, options = {}) {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    let errorData = {};
    try {
      errorData = await res.json();
    } catch {
      // non-JSON error response
    }
    const err = new Error(errorData.error || errorData.message || `API request failed with status ${res.status}`);
    err.status = res.status;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

/* =========================================================================
   Feature-Specific API Methods
   ========================================================================= */

/**
 * Fetch all recent trips
 */
export async function fetchTrips() {
  return apiFetch('/trips');
}

/**
 * Fetch specific trip graph
 */
export async function fetchTripGraph(tripId) {
  return apiFetch(`/trips/${tripId}/graph`);
}

/**
 * Trigger disruption cascade on a trip
 */
export async function disruptTrip(tripId, { nodeId, delayMinutes, disruptionType, reason }) {
  return apiFetch(`/trips/${tripId}/disrupt`, {
    method: 'POST',
    body: JSON.stringify({
      node_id: nodeId,
      delay_minutes: delayMinutes,
      disruption_type: disruptionType,
      reason
    })
  });
}

/**
 * Fetch risk radar analysis
 */
export async function fetchRiskRadarData(tripId, force = false) {
  return apiFetch(`/trips/${tripId}/risk-radar${force ? '?refresh=true' : ''}`);
}

/**
 * Fetch recovery options for trip
 */
export async function fetchRecoveryOptions(tripId, priority, includeSimulatedSplit = true) {
  return apiFetch(`/trips/${tripId}/recovery-options`, {
    method: 'POST',
    body: JSON.stringify({ priority, include_simulated_split: includeSimulatedSplit })
  });
}

/**
 * Apply a recovery plan
 */
export async function applyRecoveryPlan(tripId, plan) {
  return apiFetch(`/trips/${tripId}/apply-plan`, {
    method: 'POST',
    body: JSON.stringify({
      proposals: plan?.proposals || [],
      plan
    })
  });
}

/**
 * Detect user's next upcoming itinerary stop
 */
export async function fetchNextStop(tripId, currentTime = null, options = {}) {
  const query = currentTime ? `?current_time=${encodeURIComponent(currentTime)}` : '';
  return apiFetch(`/trips/${tripId}/next-stop${query}`, options);
}

/**
 * Seed or reset the deterministic demo trip
 */
export async function seedDemo(force = false) {
  return apiFetch('/seed-demo', {
    method: 'POST',
    body: JSON.stringify({ force })
  });
}

/**
 * Precompute buffer plan for an edge
 */
export async function precomputeBufferPlan(tripId, edgeId) {
  return apiFetch(`/trips/${tripId}/connections/${edgeId}/buffer-plan`, {
    method: 'POST'
  });
}

/**
 * Apply buffer plan for an edge
 */
export async function applyBufferPlan(tripId, edgeId) {
  return apiFetch(`/trips/${tripId}/connections/${edgeId}/buffer-plan/apply`, {
    method: 'POST'
  });
}

/**
 * Seed family fracture demo cohort
 */
export async function seedDemoCohort(tripId) {
  return apiFetch(`/trips/${tripId}/cohort/demo`, {
    method: 'POST'
  });
}

/**
 * Fetch fracture simulation data
 */
export async function fetchFractureSimulation(tripId) {
  return apiFetch(`/trips/${tripId}/cohort/fracture-simulation`);
}

export default {
  BACKEND_ROOT_URL,
  API_BASE_URL,
  isApiConfigured,
  getBackendRootUrl,
  getApiBaseUrl,
  apiFetch,
  apiFetchJson,
  fetchTrips,
  fetchTripGraph,
  disruptTrip,
  fetchRiskRadarData,
  fetchRecoveryOptions,
  applyRecoveryPlan,
  fetchNextStop,
  seedDemo,
  precomputeBufferPlan,
  applyBufferPlan,
  seedDemoCohort,
  fetchFractureSimulation
};
