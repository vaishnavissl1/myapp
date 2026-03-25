import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AnimatedContent from '../components/animated-content';
import SectionTitle from '../components/section-title';
import type { ISchedule } from '../../types';
import {
    PlusIcon, MapPinIcon, ClockIcon, GaugeIcon, Trash2Icon, ArrowRightIcon,
    CalendarIcon, Navigation2Icon, CircleDotIcon, LayoutDashboardIcon
} from 'lucide-react';

export default function Dashboard() {
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { getAccessToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => { loadSchedules(); }, []);

    async function loadSchedules() {
        try { const data = await api.getSchedules(getAccessToken); setSchedules(data); }
        catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to load schedules'); }
        finally { setLoading(false); }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this schedule?')) return;
        try { await api.deleteSchedule(id, getAccessToken); setSchedules(prev => prev.filter(s => s.id !== id)); }
        catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to delete'); }
    }

    function formatDateTime(iso: string) {
        return new Date(iso).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }

    const modeLabels: Record<string, string> = { any: 'Any', driving: 'Driving', transit: 'Transit', bicycling: 'Bicycling', walking: 'Walking' };

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen pt-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[var(--accent)]" /></div>;
    }

    return (
        <section className="px-4 md:px-16 lg:px-24 xl:px-32 pt-24 pb-16">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <SectionTitle dir="left" icon={LayoutDashboardIcon} title="Your Schedules" subtitle="Manage your travel plans and get optimized recommendations." />
                    <Link to="/schedule/new" className="py-2.5 px-6 bg-[var(--accent)] text-[var(--accent-text)] rounded-full flex items-center gap-2 text-sm hover:opacity-90 transition-opacity shrink-0" id="new-schedule-btn">
                        <PlusIcon size={16} /> New Schedule
                    </Link>
                </div>

                {error && <div className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-3 mb-6 text-[var(--error-text)] text-sm">{error}</div>}

                {schedules.length === 0 ? (
                    <AnimatedContent className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="bg-[var(--bg-muted)] p-5 rounded-full mb-6"><CalendarIcon size={36} className="text-[var(--text-muted)]" /></div>
                        <h2 className="font-urbanist text-2xl font-semibold mb-2">No schedules yet</h2>
                        <p className="text-[var(--text-secondary)] max-w-sm mb-6">Create your first travel schedule and let SmartCommute find the best departure time, route, and transport mode for you.</p>
                        <Link to="/schedule/new" className="py-2.5 px-6 bg-[var(--accent)] text-[var(--accent-text)] rounded-full flex items-center gap-2" id="empty-new-schedule-btn">
                            <PlusIcon size={16} /> Create Your First Schedule
                        </Link>
                    </AnimatedContent>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {schedules.map((schedule, index) => (
                            <AnimatedContent key={schedule.id} delay={index * 0.08} className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--card-shadow)] hover:shadow-[var(--card-hover-shadow)] transition-shadow group">
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="bg-[var(--success-bg)] p-1.5 rounded-full mt-0.5 shrink-0"><CircleDotIcon size={12} className="text-[var(--success-text)]" /></div>
                                        <div>
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">From</p>
                                            <p className="text-sm font-medium">{schedule.source_location}</p>
                                        </div>
                                    </div>
                                    <div className="w-px h-3 bg-[var(--border)] ml-[13px]" />
                                    <div className="flex items-start gap-3">
                                        <div className="bg-[var(--error-bg)] p-1.5 rounded-full mt-0.5 shrink-0"><MapPinIcon size={12} className="text-[var(--error-text)]" /></div>
                                        <div>
                                            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">To</p>
                                            <p className="text-sm font-medium">{schedule.destination_location}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3 py-3 border-t border-[var(--border)]">
                                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><ClockIcon size={13} /> {formatDateTime(schedule.arrival_time)}</span>
                                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><GaugeIcon size={13} /> ±{schedule.flexibility_minutes}min</span>
                                    <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><Navigation2Icon size={13} /> {modeLabels[schedule.transport_preference] || schedule.transport_preference}</span>
                                </div>
                                <div className="flex gap-2 pt-3">
                                    <button onClick={() => navigate(`/recommendation/${schedule.id}`)} className="flex-1 py-2 px-4 bg-[var(--accent)] text-[var(--accent-text)] rounded-full text-sm font-medium flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer" id={`recommend-btn-${schedule.id}`}>
                                        <ArrowRightIcon size={14} /> Get Recommendation
                                    </button>
                                    <button onClick={() => handleDelete(schedule.id)} className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--error-bg)] hover:border-[var(--error-border)] hover:text-[var(--error-text)] transition-all cursor-pointer" title="Delete" id={`delete-btn-${schedule.id}`}>
                                        <Trash2Icon size={16} />
                                    </button>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
