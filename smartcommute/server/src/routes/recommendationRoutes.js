import { Router } from 'express';
import supabase from '../config/supabase.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { generateRecommendation } from '../services/recommendationEngine.js';

const router = Router();
router.use(authMiddleware);

/**
 * GET /api/recommendation/:scheduleId — generate travel recommendation
 * Fetches the schedule, verifies ownership, computes recommendation.
 * Now async — uses real ORS data when available, falls back to mock.
 */
router.get('/:scheduleId', async (req, res) => {
    try {
        if (!supabase) return res.status(503).json({ error: 'Database not configured' });

        const { data: schedule, error } = await supabase
            .from('schedules')
            .select('*')
            .eq('id', req.params.scheduleId)
            .eq('user_id', req.userId)
            .single();

        if (error || !schedule) {
            return res.status(404).json({ error: 'Schedule not found' });
        }

        const recommendation = await generateRecommendation(schedule);
        res.json(recommendation);
    } catch (err) {
        console.error('[GET /recommendation/:id]', err);
        res.status(500).json({ error: err.message || 'Failed to generate recommendation' });
    }
});

export default router;
