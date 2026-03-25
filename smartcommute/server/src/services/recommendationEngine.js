/**
 * Recommendation Engine — computes optimal departure time and ranks transport modes.
 * 
 * Now supports REAL route data from OpenRouteService:
 *  1. Fetch real base durations + distances from ORS for each transport mode
 *  2. For each departure slot in the flexibility window, apply traffic multipliers
 *  3. Pick the departure time with the lowest adjusted travel duration
 *  4. Rank all transport modes at the optimal departure time
 * 
 * Falls back to mock data if coordinates are not available in the schedule.
 */

import { getAllRoutes } from './routingService.js';
import { applyTrafficToRoute, getMockTrafficData, getRouteData } from './trafficService.js';

const ALL_MODES = ['driving', 'transit', 'bicycling', 'walking'];
const SCAN_INTERVAL_MINUTES = 5;

/**
 * @param {object} schedule — schedule object from Supabase
 * @returns {Promise<object>} — recommendation result
 */
export async function generateRecommendation(schedule) {
    const arrivalTime = new Date(schedule.arrival_time);
    const flexibility = schedule.flexibility_minutes || 30;
    const preferredMode = schedule.transport_preference === 'any' ? 'driving' : schedule.transport_preference;

    const hasCoords = schedule.source_lat && schedule.source_lng && schedule.dest_lat && schedule.dest_lng;

    // ── Try real routing data ────────────────────────────────
    if (hasCoords) {
        try {
            console.log(`[Recommendation] Fetching real routes: (${schedule.source_lat},${schedule.source_lng}) → (${schedule.dest_lat},${schedule.dest_lng})`);
            const routes = await getAllRoutes(schedule.source_lat, schedule.source_lng, schedule.dest_lat, schedule.dest_lng);

            if (Object.keys(routes).length > 0) {
                return buildRealRecommendation(schedule, routes, arrivalTime, flexibility, preferredMode);
            }

            console.warn('[Recommendation] ORS returned no routes, falling back to mock');
        } catch (err) {
            console.error('[Recommendation] ORS error, falling back to mock:', err.message);
        }
    }

    // ── Fallback to mock ─────────────────────────────────────
    return buildMockRecommendation(schedule, arrivalTime, flexibility, preferredMode);
}

/**
 * Build recommendation using real ORS route data + traffic multipliers.
 */
function buildRealRecommendation(schedule, routes, arrivalTime, flexibility, preferredMode) {
    const preferredRoute = routes[preferredMode] || routes.driving;
    if (!preferredRoute) throw new Error('No route data available for preferred mode');

    // 1. Find the best departure time using real base duration + traffic adjustments
    const bestDeparture = findBestDepartureReal(
        preferredRoute.duration,
        preferredRoute.distance,
        arrivalTime,
        flexibility,
        preferredMode
    );

    // 2. Evaluate all transport modes at the best departure time
    const transportModes = ALL_MODES.map(mode => {
        const routeData = routes[mode];
        if (!routeData) {
            return { mode, duration: 999, distance: 0, congestion: 'unknown', trafficMultiplier: 1, rank: 99 };
        }
        const adjusted = applyTrafficToRoute(routeData.duration, routeData.distance, bestDeparture.time, mode);
        return { mode, ...adjusted };
    }).filter(m => m.duration < 999);

    // 3. Rank by duration
    transportModes.sort((a, b) => a.duration - b.duration);
    transportModes.forEach((m, i) => { m.rank = i + 1; });

    // 4. Route data
    const drivingRoute = routes.driving || Object.values(routes)[0];
    const route = {
        summary: `${schedule.source_location} → ${schedule.destination_location}`,
        distance: drivingRoute.distance,
        navigationUrl: `https://www.google.com/maps/dir/${encodeURIComponent(schedule.source_location)}/${encodeURIComponent(schedule.destination_location)}`
    };

    return {
        scheduleId: schedule.id,
        recommendation: {
            departureTime: bestDeparture.time.toISOString(),
            arrivalTime: arrivalTime.toISOString(),
            estimatedDuration: bestDeparture.duration,
            distance: bestDeparture.distance,
            congestion: bestDeparture.congestion,
            trafficMultiplier: bestDeparture.trafficMultiplier
        },
        transportModes,
        route,
        dataSource: 'openrouteservice',
        generatedAt: new Date().toISOString()
    };
}

/**
 * Find best departure time using real base duration + traffic adjustments.
 */
function findBestDepartureReal(baseDuration, distance, arrivalTime, flexibility, mode) {
    const windowStart = new Date(arrivalTime.getTime() - (flexibility + Math.ceil(baseDuration * 2.5)) * 60_000);
    const windowEnd = new Date(arrivalTime.getTime() - 5 * 60_000);

    let best = null;

    for (let t = windowStart.getTime(); t <= windowEnd.getTime(); t += SCAN_INTERVAL_MINUTES * 60_000) {
        const departureCandidate = new Date(t);
        const adjusted = applyTrafficToRoute(baseDuration, distance, departureCandidate, mode);
        const estimatedArrival = new Date(departureCandidate.getTime() + adjusted.duration * 60_000);

        const arrivalDiff = Math.abs(estimatedArrival.getTime() - arrivalTime.getTime()) / 60_000;
        if (arrivalDiff <= flexibility) {
            if (!best || adjusted.duration < best.duration) {
                best = { time: departureCandidate, ...adjusted };
            }
        }
    }

    // Fallback
    if (!best) {
        const adjusted = applyTrafficToRoute(baseDuration, distance, arrivalTime, mode);
        const fallbackDeparture = new Date(arrivalTime.getTime() - adjusted.duration * 60_000);
        best = { time: fallbackDeparture, ...adjusted };
    }

    return best;
}

/**
 * Fallback: Build recommendation using mock traffic data.
 */
function buildMockRecommendation(schedule, arrivalTime, flexibility, preferredMode) {
    const bestDeparture = findBestDepartureMock(schedule, arrivalTime, flexibility, preferredMode);

    const transportModes = ALL_MODES.map(mode => {
        const data = getMockTrafficData(schedule.source_location, schedule.destination_location, bestDeparture.time, mode);
        return { mode, ...data };
    });

    transportModes.sort((a, b) => a.duration - b.duration);
    transportModes.forEach((m, i) => { m.rank = i + 1; });

    const route = getRouteData(schedule.source_location, schedule.destination_location);

    return {
        scheduleId: schedule.id,
        recommendation: {
            departureTime: bestDeparture.time.toISOString(),
            arrivalTime: arrivalTime.toISOString(),
            estimatedDuration: bestDeparture.duration,
            distance: bestDeparture.distance,
            congestion: bestDeparture.congestion,
            trafficMultiplier: bestDeparture.trafficMultiplier
        },
        transportModes,
        route,
        dataSource: 'simulated',
        generatedAt: new Date().toISOString()
    };
}

function findBestDepartureMock(schedule, arrivalTime, flexibility, mode) {
    const windowStart = new Date(arrivalTime.getTime() - (flexibility + 120) * 60_000);
    const windowEnd = new Date(arrivalTime.getTime() - 5 * 60_000);

    let best = null;

    for (let t = windowStart.getTime(); t <= windowEnd.getTime(); t += SCAN_INTERVAL_MINUTES * 60_000) {
        const departureCandidate = new Date(t);
        const data = getMockTrafficData(schedule.source_location, schedule.destination_location, departureCandidate, mode);
        const estimatedArrival = new Date(departureCandidate.getTime() + data.duration * 60_000);

        const arrivalDiff = Math.abs(estimatedArrival.getTime() - arrivalTime.getTime()) / 60_000;
        if (arrivalDiff <= flexibility) {
            if (!best || data.duration < best.duration) {
                best = { time: departureCandidate, ...data };
            }
        }
    }

    if (!best) {
        const data = getMockTrafficData(schedule.source_location, schedule.destination_location, arrivalTime, mode);
        const fallbackDeparture = new Date(arrivalTime.getTime() - data.duration * 60_000);
        best = { time: fallbackDeparture, ...data };
    }

    return best;
}
