import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { links } from "../data/links";
import AnimatedContent from "./animated-content";
import type { ILink } from "../../types";
import { MenuIcon, XIcon, LogOutIcon, Navigation2Icon, PlusIcon, LayoutDashboardIcon, SunIcon, MoonIcon, UserIcon } from "lucide-react";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    async function handleLogout() {
        try { await logout(); navigate('/login'); }
        catch (err) { console.error('Logout failed:', err); }
    }

    if (['/login', '/signup'].includes(location.pathname)) return null;

    const isLanding = location.pathname === '/';

    const ThemeToggle = () => (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--bg-muted)] transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            id="theme-toggle"
        >
            {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
    );

    // ─── PUBLIC NAVBAR (Landing Page) ────────────────────────
    if (isLanding && !user) {
        return (
            <>
                <AnimatedContent reverse>
                    <nav className="fixed w-full top-0 z-50 px-4 md:px-16 lg:px-24 xl:px-32 py-4 border-b transition-all duration-300 border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-lg">
                        <div className="max-w-7xl mx-auto flex items-center justify-between">
                            <a href="/" className="flex items-center gap-2.5">
                                <div className="bg-[var(--accent)] p-1.5 rounded-lg text-[var(--accent-text)]">
                                    <Navigation2Icon size={20} />
                                </div>
                                <span className="font-urbanist font-bold text-xl">SmartCommute</span>
                            </a>

                            <div className="hidden md:flex gap-3">
                                {links.map((link: ILink) => (
                                    <a key={link.name} href={link.href} className="py-1 px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                        {link.name}
                                    </a>
                                ))}
                            </div>

                            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                <MenuIcon className="size-6.5" />
                            </button>

                            <div className="hidden md:flex items-center gap-3">
                                <ThemeToggle />
                                <Link to="/login" className="py-2 px-5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="py-2 px-5 bg-[var(--accent)] text-[var(--accent-text)] rounded-full text-sm hover:opacity-90 transition-opacity">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </nav>
                </AnimatedContent>

                {/* Mobile menu — landing */}
                <div className={`fixed top-0 right-0 z-60 w-full bg-[var(--bg-card)] shadow-xl transition-all duration-300 ease-in-out ${isMenuOpen ? "h-auto pb-4 overflow-hidden" : "h-0 overflow-hidden"}`}>
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-[var(--accent)] p-1.5 rounded-lg text-[var(--accent-text)]"><Navigation2Icon size={20} /></div>
                            <span className="font-urbanist font-bold text-xl">SmartCommute</span>
                        </div>
                        <XIcon className="size-6.5 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                    </div>
                    <div className="flex flex-col gap-4 p-4 text-base">
                        {links.map((link: ILink) => (
                            <a key={link.name} href={link.href} className="py-1 px-3" onClick={() => setIsMenuOpen(false)}>{link.name}</a>
                        ))}
                        <div className="flex items-center gap-3 px-3">
                            <ThemeToggle />
                            <span className="text-sm text-[var(--text-muted)]">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
                        </div>
                        <Link to="/login" className="py-1 px-3" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                        <Link to="/signup" className="py-2.5 px-6 w-max text-sm bg-[var(--accent)] text-[var(--accent-text)] rounded-full" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </div>
                </div>
            </>
        );
    }

    // ─── AUTHENTICATED NAVBAR (App Pages) ────────────────────
    if (!user) return null;

    return (
        <>
            <AnimatedContent reverse>
                <nav className="fixed w-full top-0 z-50 px-4 md:px-16 lg:px-24 xl:px-32 py-4 border-b transition-all duration-300 border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-lg">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <Link to="/dashboard" className="flex items-center gap-2.5">
                            <div className="bg-[var(--accent)] p-1.5 rounded-lg text-[var(--accent-text)]">
                                <Navigation2Icon size={20} />
                            </div>
                            <span className="font-urbanist font-bold text-xl">SmartCommute</span>
                        </Link>

                        <div className="hidden md:flex gap-3">
                            <Link to="/dashboard" className="py-1 px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
                                <LayoutDashboardIcon size={16} /> Dashboard
                            </Link>
                            <Link to="/schedule/new" className="py-1 px-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
                                <PlusIcon size={16} /> New Schedule
                            </Link>
                        </div>

                        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <MenuIcon className="size-6.5" />
                        </button>

                        <div className="hidden md:flex items-center gap-3">
                            <ThemeToggle />
                            <Link to="/profile" className="text-sm text-[var(--text-muted)] truncate max-w-40 hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors">
                                <UserIcon size={14} /> {user.email}
                            </Link>
                            <button onClick={handleLogout} className="py-2 px-5 bg-[var(--accent)] text-[var(--accent-text)] rounded-full flex items-center gap-2 text-sm cursor-pointer hover:opacity-90 transition-opacity" id="logout-btn">
                                <LogOutIcon size={14} /> Logout
                            </button>
                        </div>
                    </div>
                </nav>
            </AnimatedContent>

            {/* Mobile menu — authenticated */}
            <div className={`fixed top-0 right-0 z-60 w-full bg-[var(--bg-card)] shadow-xl transition-all duration-300 ease-in-out ${isMenuOpen ? "h-auto pb-4 overflow-hidden" : "h-0 overflow-hidden"}`}>
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-[var(--accent)] p-1.5 rounded-lg text-[var(--accent-text)]"><Navigation2Icon size={20} /></div>
                        <span className="font-urbanist font-bold text-xl">SmartCommute</span>
                    </div>
                    <XIcon className="size-6.5 cursor-pointer" onClick={() => setIsMenuOpen(false)} />
                </div>
                <div className="flex flex-col gap-4 p-4 text-base">
                    <Link to="/dashboard" className="py-1 px-3 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboardIcon size={18} /> Dashboard
                    </Link>
                    <Link to="/schedule/new" className="py-1 px-3 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <PlusIcon size={18} /> New Schedule
                    </Link>
                    <div className="flex items-center gap-3 px-3">
                        <ThemeToggle />
                        <span className="text-sm text-[var(--text-muted)]">{theme === 'dark' ? 'Dark' : 'Light'} mode</span>
                    </div>
                    <Link to="/profile" className="py-1 px-3 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
                        <UserIcon size={18} /> Profile
                    </Link>
                    <span className="text-sm text-[var(--text-muted)] px-3">{user.email}</span>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="py-2.5 px-6 w-max text-sm bg-[var(--accent)] text-[var(--accent-text)] rounded-full cursor-pointer">
                        <LogOutIcon size={14} className="inline mr-1" /> Logout
                    </button>
                </div>
            </div>
        </>
    );
}