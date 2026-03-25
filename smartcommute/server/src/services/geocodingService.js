/**
 * Geocoding Service — converts address strings to lat/lng coordinates using Nominatim.
 * 
 * Nominatim is free and requires no API key.
 * Rate limit: 1 request per second (we add a small delay between calls).
 * 
 * @see https://nominatim.org/release-docs/develop/api/Search/
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Simple delay helper for rate limiting
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Geocode an address string to coordinates.
 * @param {string} address — human-readable address
 * @returns {Promise<{ lat: number, lng: number, displayName: string } | null>}
 */
export async function geocodeAddress(address) {
    try {
        const params = new URLSearchParams({
            q: address,
            format: 'json',
            limit: '1',
            addressdetails: '0'
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: {
                'User-Agent': 'SmartCommute/1.0 (student-project)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`[Geocoding] HTTP ${response.status} for "${address}"`);
            return null;
        }

        const results = await response.json();

        if (!results.length) {
            console.warn(`[Geocoding] No results for "${address}"`);
            return null;
        }

        const result = results[0];
        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            displayName: result.display_name
        };
    } catch (err) {
        console.error(`[Geocoding] Error for "${address}":`, err.message);
        return null;
    }
}

/**
 * Geocode two addresses with a delay between calls to respect rate limits.
 * @param {string} source 
 * @param {string} destination
 * @returns {Promise<{ source: { lat, lng, displayName }, destination: { lat, lng, displayName } } | null>}
 */
export async function geocodePair(source, destination) {
    const sourceResult = await geocodeAddress(source);
    await delay(1100); // Nominatim requires 1 req/sec
    const destResult = await geocodeAddress(destination);

    if (!sourceResult || !destResult) {
        return null;
    }

    return { source: sourceResult, destination: destResult };
}

/**
 * Autocomplete proxy for frontend to avoid browser CORS/User-Agent issues.
 * @param {string} query 
 * @returns {Promise<any[]>}
 */
export async function autocompleteAddress(query) {
    try {
        const params = new URLSearchParams({
            q: query,
            format: 'json',
            limit: '5',
            addressdetails: '1'
        });

        const response = await fetch(`${NOMINATIM_URL}?${params}`, {
            headers: {
                'User-Agent': 'SmartCommute/1.0 (student-project)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (err) {
        console.error(`[Autocomplete] Error for "${query}":`, err.message);
        return [];
    }
}
