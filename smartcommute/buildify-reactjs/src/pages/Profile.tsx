import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AnimatedContent from '../components/animated-content';
import SectionTitle from '../components/section-title';
import { UserIcon, MailIcon, CalendarIcon, ShieldCheckIcon, LogOutIcon, ArrowLeftIcon } from 'lucide-react';

export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try { await logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    }

    if (!user) return null;

    const joinedDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <section className="px-4 md:px-16 lg:px-24 xl:px-32 pt-24 pb-16">
            <div className="max-w-2xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                    <ArrowLeftIcon size={16} /> Back to Dashboard
                </button>

                <AnimatedContent className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] shadow-[var(--card-shadow)] p-6 md:p-8">
                    <SectionTitle dir="left" icon={UserIcon} title="Profile" subtitle="Your account details." />

                    <div className="mt-8 space-y-6">
                        {/* Avatar / initials */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-[var(--accent)] text-[var(--accent-text)] flex items-center justify-center text-2xl font-bold font-urbanist">
                                {user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-semibold text-lg">{user.email}</p>
                                <p className="text-sm text-[var(--text-muted)]">Commuter</p>
                            </div>
                        </div>

                        {/* Info cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <MailIcon size={16} className="text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Email</span>
                                </div>
                                <p className="text-sm font-medium truncate">{user.email}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon size={16} className="text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Joined</span>
                                </div>
                                <p className="text-sm font-medium">{joinedDate}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheckIcon size={16} className="text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Auth Provider</span>
                                </div>
                                <p className="text-sm font-medium capitalize">{user.app_metadata?.provider || 'email'}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-[var(--bg-muted)] border border-[var(--border)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <UserIcon size={16} className="text-[var(--text-muted)]" />
                                    <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">User ID</span>
                                </div>
                                <p className="text-sm font-medium font-mono truncate text-[var(--text-secondary)]">{user.id}</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="pt-4 border-t border-[var(--border)]">
                            <button
                                onClick={handleLogout}
                                className="py-2.5 px-6 bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error-text)] rounded-full flex items-center gap-2 text-sm hover:opacity-90 transition-opacity cursor-pointer"
                                id="profile-logout-btn"
                            >
                                <LogOutIcon size={16} /> Sign Out
                            </button>
                        </div>
                    </div>
                </AnimatedContent>
            </div>
        </section>
    );
}
