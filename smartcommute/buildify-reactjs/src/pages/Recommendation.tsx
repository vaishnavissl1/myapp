import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AnimatedContent from '../components/animated-content';
import type { IRecommendation, TransportMode } from '../../types';
import {
    ArrowLeftIcon, Navigation2Icon, ExternalLinkIcon,
    CarIcon, TrainFrontIcon, BikeIcon, FootprintsIcon, RouteIcon
} from 'lucide-react';

const MODE_ICONS: Record<TransportMode, React.ElementType> = { driving: CarIcon, transit: TrainFrontIcon, bicycling: BikeIcon, walking: FootprintsIcon };
const MODE_LABELS: Record<TransportMode, string> = { driving: 'Driving', transit: 'Public Transit', bicycling: 'Bicycling', walking: 'Walking' };

const CONGESTION_STYLES: Record<string, string> = {
    low: 'bg-[var(--success-bg)] text-[var(--success-text)]',
    medium: 'bg-amber-900/30 text-amber-400',
    high: 'bg-[var(--error-bg)] text-[var(--error-text)]'
};

export default function Recommendation() {
    const { scheduleId } = useParams<{ scheduleId: string }>();
    const [rec, setRec] = useState<IRecommendation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { getAccessToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { loadRec(); }, [scheduleId]);

    async function loadRec() {
        setLoading(true); setError('');
        try { setRec(await api.getRecommendation(scheduleId!, getAccessToken)); }
        catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load recommendation'); }
        finally { setLoading(false); }
    }

    function formatTime(iso: string) { return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    function formatDate(iso: string) { return new Date(iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }); }
    function formatDuration(min: number) { if (min < 60) return `${min} min`; const h = Math.floor(min / 60); const m = min % 60; return m > 0 ? `${h}h ${m}m` : `${h}h`; }

    if (loading) {
        return <div className="flex flex-col items-center justify-center min-h-screen gap-3 pt-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]" /><p className="text-[var(--text-secondary)] text-sm">Computing your optimal travel plan...</p></div>;
    }
    if (error || !rec) {
        return <div className="flex flex-col items-center justify-center min-h-screen gap-4 pt-20 px-4"><div className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-4 text-[var(--error-text)] text-sm max-w-md">{error}</div><button onClick={() => navigate('/dashboard')} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 cursor-pointer"><ArrowLeftIcon size={16} /> Back to Dashboard</button></div>;
    }

    const r = rec.recommendation;
    const modes = rec.transportModes;
    const route = rec.route;

    return (
        <section className="px-4 md:px-16 lg:px-24 xl:px-32 pt-24 pb-16">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"><ArrowLeftIcon size={16} /> Back to Dashboard</button>

                {/* Hero: Departure Time */}
                <AnimatedContent className="bg-[var(--accent)] rounded-2xl p-8 md:p-12 text-center mb-8">
                    <p className="text-xs uppercase tracking-widest text-[var(--accent-text)]/60 font-semibold mb-2">Recommended Departure</p>
                    <h1 className="font-urbanist text-5xl md:text-6xl font-bold text-[var(--accent-text)]" id="departure-time">{formatTime(r.departureTime)}</h1>
                    <p className="text-[var(--accent-text)]/60 mt-1">{formatDate(r.departureTime)}</p>
                    <div className="mt-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase ${CONGESTION_STYLES[r.congestion]}`} id="congestion-badge">
                            <span className="w-2 h-2 rounded-full bg-current" />{r.congestion} traffic
                        </span>
                    </div>
                </AnimatedContent>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Arrival', value: formatTime(r.arrivalTime), id: 'arrival-time' },
                        { label: 'Duration', value: formatDuration(r.estimatedDuration), id: 'travel-duration' },
                        { label: 'Distance', value: `${r.distance} km`, id: 'travel-distance' },
                        { label: 'Traffic Factor', value: `${r.trafficMultiplier}x`, id: 'traffic-factor' }
                    ].map((stat, i) => (
                        <AnimatedContent key={stat.id} delay={i * 0.08} className="p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-center shadow-[var(--card-shadow)]">
                            <p className="font-urbanist text-2xl font-semibold" id={stat.id}>{stat.value}</p>
                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">{stat.label}</p>
                        </AnimatedContent>
                    ))}
                </div>

                {/* Transport Modes */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4"><Navigation2Icon size={18} /><h2 className="font-urbanist text-xl font-semibold">Transport Mode Comparison</h2></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {modes.map((mode, i) => {
                            const Icon = MODE_ICONS[mode.mode] || CarIcon;
                            const isBest = mode.rank === 1;
                            return (
                                <AnimatedContent key={mode.mode} delay={i * 0.08}
                                    className={`relative p-5 rounded-xl border ${isBest ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[var(--bg-card)]'} shadow-[var(--card-shadow)]`}>
                                    {isBest && <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-text)] rounded-full">Best</span>}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className={`p-2 rounded-lg ${isBest ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'bg-[var(--bg-muted)]'}`}><Icon size={20} /></div>
                                        <div>
                                            <p className="font-medium">{MODE_LABELS[mode.mode]}</p>
                                            <p className="text-xs text-[var(--text-muted)]">Rank #{mode.rank}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Duration</span><span className="font-medium">{formatDuration(mode.duration)}</span></div>
                                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Distance</span><span className="font-medium">{mode.distance} km</span></div>
                                        <div className="flex justify-between items-center"><span className="text-[var(--text-secondary)]">Traffic</span><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CONGESTION_STYLES[mode.congestion]}`}>{mode.congestion}</span></div>
                                    </div>
                                </AnimatedContent>
                            );
                        })}
                    </div>
                </div>

                {/* Route Info */}
                <AnimatedContent className="p-6 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--card-shadow)]">
                    <div className="flex items-center gap-2 mb-4"><RouteIcon size={18} /><h3 className="font-urbanist text-lg font-semibold">Route Details</h3></div>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Route</span><span className="font-medium">{route.summary}</span></div>
                        <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Distance</span><span className="font-medium">{route.distance} km</span></div>
                    </div>
                    <a href={route.navigationUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-muted)] border border-[var(--border)] rounded-full text-sm font-medium hover:opacity-90 transition-opacity" id="navigate-link">
                        <ExternalLinkIcon size={14} /> Open in Google Maps
                    </a>
                </AnimatedContent>

                <p className="text-center text-xs text-[var(--text-muted)] mt-6">Generated {new Date(rec.generatedAt).toLocaleString()} · Simulated traffic data</p>
            </div>
        </section>
    );
}
