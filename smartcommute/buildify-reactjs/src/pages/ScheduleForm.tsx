import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AnimatedContent from '../components/animated-content';
import SectionTitle from '../components/section-title';
import LocationAutocomplete from '../components/LocationAutocomplete';
import { ClockIcon, GaugeIcon, Navigation2Icon, SendIcon, ArrowLeftIcon, CircleDotIcon, SparkleIcon, MapPinIcon } from 'lucide-react';

export default function ScheduleForm() {
    const [form, setForm] = useState({ source_location: '', destination_location: '', arrival_time: '', flexibility_minutes: 30, transport_preference: 'any' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { getAccessToken } = useAuth();
    const navigate = useNavigate();

    function handleChange(field: string, value: string | number) { setForm(prev => ({ ...prev, [field]: value })); }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); setError('');
        const errors: string[] = [];
        if (!form.source_location.trim()) errors.push('Starting location is required');
        if (!form.destination_location.trim()) errors.push('Destination is required');
        if (!form.arrival_time) errors.push('Arrival time is required');
        if (errors.length) { setError(errors.join('. ')); return; }
        setLoading(true);
        try { const s = await api.createSchedule({ ...form, arrival_time: new Date(form.arrival_time).toISOString() }, getAccessToken); navigate(`/recommendation/${s.id}`); }
        catch (err: unknown) { setError(err instanceof Error ? err.message : 'Failed to create schedule'); }
        finally { setLoading(false); }
    }

    const inputClass = "w-full px-4 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all";

    return (
        <section className="px-4 md:px-16 lg:px-24 xl:px-32 pt-24 pb-16">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                    <ArrowLeftIcon size={16} /> Back to Dashboard
                </button>

                <AnimatedContent className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] p-6 md:p-8">
                    <SectionTitle dir="left" icon={SparkleIcon} title="New Schedule" subtitle="Enter your commute details to get optimized travel recommendations." />

                    {error && <div className="bg-[var(--error-bg)] border border-[var(--error-border)] rounded-xl p-3 mt-6 text-[var(--error-text)] text-sm" id="schedule-error">{error}</div>}

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="source-location">
                                <CircleDotIcon size={14} className="inline mr-1.5 -translate-y-px text-[var(--success-text)]" /> Starting Location
                            </label>
                            <LocationAutocomplete
                                id="source-location"
                                value={form.source_location}
                                onChange={(val) => handleChange('source_location', val)}
                                placeholder="Search for starting location..."
                                icon={<CircleDotIcon size={16} className="text-[var(--success-text)]" />}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="dest-location">
                                <MapPinIcon size={14} className="inline mr-1.5 -translate-y-px text-[var(--error-text)]" /> Destination
                            </label>
                            <LocationAutocomplete
                                id="dest-location"
                                value={form.destination_location}
                                onChange={(val) => handleChange('destination_location', val)}
                                placeholder="Search for destination..."
                                icon={<MapPinIcon size={16} className="text-[var(--error-text)]" />}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="arrival-time">
                                <ClockIcon size={14} className="inline mr-1.5 -translate-y-px" /> Preferred Arrival Time
                            </label>
                            <input id="arrival-time" type="datetime-local" className={inputClass} value={form.arrival_time} onChange={(e) => handleChange('arrival_time', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="flexibility">
                                <GaugeIcon size={14} className="inline mr-1.5 -translate-y-px" /> Flexibility Window
                            </label>
                            <div className="bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs text-[var(--text-muted)]">0 min</span>
                                    <span className="text-sm font-bold bg-[var(--accent)] text-[var(--accent-text)] py-1 px-4 rounded-full">
                                        ± {form.flexibility_minutes} min
                                    </span>
                                    <span className="text-xs text-[var(--text-muted)]">120 min</span>
                                </div>
                                <input
                                    id="flexibility"
                                    type="range"
                                    min="0"
                                    max="120"
                                    step="5"
                                    value={form.flexibility_minutes}
                                    onChange={(e) => handleChange('flexibility_minutes', parseInt(e.target.value))}
                                    className="custom-slider w-full"
                                    style={{
                                        background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${(form.flexibility_minutes / 120) * 100}%, var(--bg-muted) ${(form.flexibility_minutes / 120) * 100}%, var(--bg-muted) 100%)`
                                    }}
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-2">
                                    You can depart {form.flexibility_minutes > 0 ? `up to ${form.flexibility_minutes} minutes earlier or later` : 'only at the exact time'}
                                </p>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5" htmlFor="transport">
                                <Navigation2Icon size={14} className="inline mr-1.5 -translate-y-px" /> Transport Preference
                            </label>
                            <select id="transport" value={form.transport_preference} onChange={(e) => handleChange('transport_preference', e.target.value)} className={`${inputClass} appearance-none cursor-pointer`}>
                                <option value="any">Any (compare all modes)</option>
                                <option value="driving">🚗 Driving</option>
                                <option value="transit">🚌 Public Transit</option>
                                <option value="bicycling">🚲 Bicycling</option>
                                <option value="walking">🚶 Walking</option>
                            </select>
                        </div>
                        <button type="submit" disabled={loading} className="w-full py-3 bg-[var(--accent)] text-[var(--accent-text)] rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer mt-2" id="schedule-submit">
                            {loading ? (<><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-[var(--accent-text)]" /> Creating...</>) : (<><SendIcon size={18} /> Get Travel Recommendation</>)}
                        </button>
                    </form>
                </AnimatedContent>
            </div>
        </section>
    );
}
