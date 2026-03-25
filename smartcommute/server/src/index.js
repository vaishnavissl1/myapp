import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import scheduleRoutes from './routes/scheduleRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://127.0.0.1:5174'],
    credentials: true
}));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────
app.use('/api/schedules', scheduleRoutes);
app.use('/api/recommendation', recommendationRoutes);

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[Unhandled Error]', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ── Start ──────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n  ✦ SmartCommute API running → http://localhost:${PORT}`);
    console.log(`  ✦ Health check → http://localhost:${PORT}/api/health\n`);
});
