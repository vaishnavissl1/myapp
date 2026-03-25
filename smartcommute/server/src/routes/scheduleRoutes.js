import { Router } from 'express';
import supabase from '../config/supabase.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { geocodePair, autocompleteAddress } from '../services/geocodingService.js';

const router = Router();

/**
 * GET /api/schedules/autocomplete — proxy Nominatim search
 * Query: ?q=search_text
 * Public route (no auth required) to avoid token issues during typing
 */
router.get('/autocomplete', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query || query.length < 3) return res.json([]);
        const results = await autocompleteAddress(query);
        res.json(results);
    } catch (err) {
        console.error('[GET /autocomplete]', err);
        res.status(500).json({ error: 'Autocomplete failed' });
    }
});

// All other schedule routes require auth
router.use(authMiddleware);

const VALID_MODES = ['driving', 'transit', 'bicycling', 'walking', 'any'];

/**
 * POST /api/schedules — create a new schedule
 * Body: { source_location, destination_location, arrival_time, flexibility_minutes?, transport_preference? }
 * 
 * Automatically geocodes source + destination using Nominatim.
 */
router.post('/', async (req, res) => {
    try {
        if (!supabase) return res.status(503).json({ error: 'Database not configured' });

        const { source_location, destination_location, arrival_time, flexibility_minutes = 30, transport_preference = 'any' } = req.body;

        // Validate required fields
        const errors = [];
        if (!source_location?.trim()) errors.push('source_location is required');
        if (!destination_location?.trim()) errors.push('destination_location is required');
        if (!arrival_time) errors.push('arrival_time is required');
        if (arrival_time && isNaN(new Date(arrival_time).getTime())) errors.push('arrival_time must be a valid ISO date');
        if (!VALID_MODES.includes(transport_preference)) errors.push(`transport_preference must be one of: ${VALID_MODES.join(', ')}`);
        if (flexibility_minutes < 0 || flexibility_minutes > 120) errors.push('flexibility_minutes must be 0–120');

        if (errors.length) return res.status(400).json({ errors });

        // Geocode both addresses
        let source_lat = null, source_lng = null, dest_lat = null, dest_lng = null;
        try {
            console.log(`[Schedule] Geocoding: "${source_location}" → "${destination_location}"`);
            const coords = await geocodePair(source_location.trim(), destination_location.trim());
            if (coords) {
                source_lat = coords.source.lat;
                source_lng = coords.source.lng;
                dest_lat = coords.destination.lat;
                dest_lng = coords.destination.lng;
                console.log(`[Schedule] Geocoded: (${source_lat},${source_lng}) → (${dest_lat},${dest_lng})`);
            } else {
                console.warn('[Schedule] Geocoding failed — schedule will use mock data for recommendations');
            }
        } catch (geoErr) {
            console.warn('[Schedule] Geocoding error:', geoErr.message);
        }

        const { data, error } = await supabase
            .from('schedules')
            .insert({
                user_id: req.userId,
                source_location: source_location.trim(),
                destination_location: destination_location.trim(),
                arrival_time,
                flexibility_minutes,
                transport_preference,
                source_lat,
                source_lng,
                dest_lat,
                dest_lng
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('[POST /schedules]', err);
        res.status(500).json({ error: err.message || 'Failed to create schedule' });
    }
});

/**
 * GET /api/schedules — list current user's schedules
 */
router.get('/', async (req, res) => {
    try {
        if (!supabase) return res.status(503).json({ error: 'Database not configured' });

        const { data, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('[GET /schedules]', err);
        res.status(500).json({ error: err.message || 'Failed to fetch schedules' });
    }
});

/**
 * DELETE /api/schedules/:id — delete a schedule
 */
router.delete('/:id', async (req, res) => {
    try {
        if (!supabase) return res.status(503).json({ error: 'Database not configured' });

        const { error } = await supabase
            .from('schedules')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.status(204).end();
    } catch (err) {
        console.error('[DELETE /schedules/:id]', err);
        res.status(500).json({ error: err.message || 'Failed to delete schedule' });
    }
});

export default router;
