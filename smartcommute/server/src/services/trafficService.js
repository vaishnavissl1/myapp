/**
 * Traffic Service — applies time-of-day traffic multipliers to base route data.
 * 
 * Instead of mocking everything, this service takes REAL base durations from ORS
 * and adjusts them based on when the user wants to depart:
 *  - Peak hours (7–10 AM, 5–8 PM) → up to 2.5× for driving
 *  - Off-peak → 1.0–1.2×
 *  - Transit gets 60% of traffic impact, cycling 30%, walking 0%
 */

function getTrafficMultiplier(hour) {
    if (hour >= 7 && hour < 10) return 1.5 + (Math.sin((hour - 7) * Math.PI / 3) * 1.0);
    if (hour >= 17 && hour < 20) return 1.5 + (Math.sin((hour - 17) * Math.PI / 3) * 1.0);
    if (hour >= 10 && hour < 12) return 1.2;
    if (hour >= 14 && hour < 17) return 1.3;
    return 1.0;
}

function getCongestionLevel(multiplier) {
    if (multiplier < 1.3) return 'low';
    if (multiplier < 1.8) return 'medium';
    return 'high';
}

function getModeTrafficFraction(mode) {
    switch (mode) {
        case 'transit': return 0.6;
        case 'bicycling': return 0.3;
        case 'walking': return 0.0;
        default: return 1.0; // driving
    }
}

/**
 * Apply time-of-day traffic adjustments to a base duration.
 * 
 * @param {number} baseDuration — base travel time in minutes (from ORS)
 * @param {number} distance — route distance in km (from ORS)
 * @param {Date|string} departureTime — when the user would leave
 * @param {string} mode — transport mode
 * @returns {{ duration: number, distance: number, congestion: string, trafficMultiplier: number }}
 */
export function applyTrafficToRoute(baseDuration, distance, departureTime, mode = 'driving') {
    const dt = new Date(departureTime);
    const hour = isNaN(dt.getTime()) ? new Date().getHours() : dt.getHours() + dt.getMinutes() / 60;

    const rawMultiplier = getTrafficMultiplier(hour);
    const fraction = getModeTrafficFraction(mode);
    const effectiveMultiplier = 1 + (rawMultiplier - 1) * fraction;

    const adjustedDuration = Math.round(baseDuration * effectiveMultiplier);
    const congestion = getCongestionLevel(effectiveMultiplier);

    return {
        duration: adjustedDuration,
        distance,
        congestion,
        trafficMultiplier: parseFloat(effectiveMultiplier.toFixed(2))
    };
}

/**
 * Legacy fallback — mock traffic data when ORS is unavailable.
 * Uses deterministic distance from location strings.
 */
function hashLocations(source, destination) {
    let hash = 0;
    const str = `${source}→${destination}`;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

function getBaseSpeed(mode) {
    switch (mode) {
        case 'transit': return 25;
        case 'bicycling': return 15;
        case 'walking': return 5;
        default: return 50;
    }
}

export function getMockTrafficData(source, destination, departureTime, mode = 'driving') {
    const dt = new Date(departureTime);
    const hour = isNaN(dt.getTime()) ? new Date().getHours() : dt.getHours() + dt.getMinutes() / 60;

    const hash = hashLocations(source, destination);
    const distance = 3 + (hash % 37);

    const rawMultiplier = getTrafficMultiplier(hour);
    const fraction = getModeTrafficFraction(mode);
    const effectiveMultiplier = 1 + (rawMultiplier - 1) * fraction;

    const baseSpeed = getBaseSpeed(mode);
    const baseDuration = Math.round((distance / baseSpeed) * 60);
    const duration = Math.round(baseDuration * effectiveMultiplier);
    const congestion = getCongestionLevel(effectiveMultiplier);

    return { duration, distance, congestion, trafficMultiplier: parseFloat(effectiveMultiplier.toFixed(2)) };
}

/**
 * Get route summary data (mock fallback).
 */
export function getRouteData(source, destination) {
    const hash = hashLocations(source, destination);
    const distance = 3 + (hash % 37);

    return {
        summary: `${source} → ${destination}`,
        distance,
        navigationUrl: `https://www.google.com/maps/dir/${encodeURIComponent(source)}/${encodeURIComponent(destination)}`
    };
}
