/**
 * Routing Service — gets real route data from OpenRouteService.
 * 
 * Uses the Directions API to get distance and duration for a given transport mode.
 * 
 * ORS profiles:
 *  - driving-car       → for 'driving'
 *  - cycling-regular   → for 'bicycling'
 *  - foot-walking      → for 'walking'
 *  - (no transit)      → estimated from driving data
 * 
 * Free tier: 40 requests/min, 2000/day
 * 
 * @see https://openrouteservice.org/dev/#/api-docs/v2/directions
 */

const ORS_BASE = 'https://api.openrouteservice.org/v2/directions';

const MODE_TO_PROFILE = {
    driving: 'driving-car',
    bicycling: 'cycling-regular',
    walking: 'foot-walking'
};

/**
 * Get route data from OpenRouteService.
 * 
 * @param {number} srcLat
 * @param {number} srcLng
 * @param {number} destLat
 * @param {number} destLng
 * @param {string} mode — 'driving' | 'bicycling' | 'walking'
 * @returns {Promise<{ duration: number, distance: number } | null>}
 *          duration in minutes, distance in km
 */
export async function getRouteFromORS(srcLat, srcLng, destLat, destLng, mode = 'driving') {
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        console.warn('[ORS] No API key configured — falling back to estimates');
        return null;
    }

    const profile = MODE_TO_PROFILE[mode];
    if (!profile) return null;

    try {
        // ORS expects coordinates as [lng, lat] (GeoJSON order)
        const url = `${ORS_BASE}/${profile}?api_key=${apiKey}&start=${srcLng},${srcLat}&end=${destLng},${destLat}`;

        const response = await fetch(url, {
            headers: { 'Accept': 'application/json, application/geo+json' }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[ORS] HTTP ${response.status} for ${mode}:`, errText);
            return null;
        }

        const data = await response.json();
        const segment = data.features?.[0]?.properties?.segments?.[0];

        if (!segment) {
            console.warn(`[ORS] No route segment found for ${mode}`);
            return null;
        }

        return {
            duration: Math.round(segment.duration / 60), // seconds → minutes
            distance: parseFloat((segment.distance / 1000).toFixed(1)) // meters → km
        };
    } catch (err) {
        console.error(`[ORS] Error for ${mode}:`, err.message);
        return null;
    }
}

/**
 * Get route data for all transport modes.
 * For transit, we estimate from driving data (1.4x duration due to stops).
 * 
 * @param {number} srcLat
 * @param {number} srcLng
 * @param {number} destLat
 * @param {number} destLng
 * @returns {Promise<Record<string, { duration: number, distance: number }>>}
 */
export async function getAllRoutes(srcLat, srcLng, destLat, destLng) {
    const results = {};

    // Fetch all direct modes in parallel
    const [driving, bicycling, walking] = await Promise.all([
        getRouteFromORS(srcLat, srcLng, destLat, destLng, 'driving'),
        getRouteFromORS(srcLat, srcLng, destLat, destLng, 'bicycling'),
        getRouteFromORS(srcLat, srcLng, destLat, destLng, 'walking')
    ]);

    if (driving) results.driving = driving;
    if (bicycling) results.bicycling = bicycling;
    if (walking) results.walking = walking;

    // Estimate transit from driving data (stops + detours ≈ 1.4x duration)
    if (driving) {
        results.transit = {
            duration: Math.round(driving.duration * 1.4),
            distance: parseFloat((driving.distance * 1.1).toFixed(1)) // slightly longer route
        };
    }

    return results;
}
