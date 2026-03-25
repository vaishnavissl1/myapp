import { useState, useEffect, useRef } from 'react';
import { MapPinIcon, Loader2Icon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    type: string;
    address?: Record<string, string>;
}

interface LocationAutocompleteProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    autoFocus?: boolean;
}

export default function LocationAutocomplete({
    id,
    value,
    onChange,
    placeholder = 'Search for a location...',
    icon,
    autoFocus = false
}: LocationAutocompleteProps) {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const { getAccessToken } = useAuth();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => { setQuery(value); }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    function handleInputChange(text: string) {
        setQuery(text);
        onChange(text);
        setSelectedIndex(-1);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (text.trim().length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        debounceRef.current = setTimeout(() => fetchSuggestions(text.trim()), 400);
    }

    async function fetchSuggestions(searchText: string) {
        setLoading(true);
        try {
            const params = new URLSearchParams({ q: searchText });

            // Fetch through our backend proxy (VITE_API_URL already points to /api)
            const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:3001/api';
            const response = await fetch(
                `${baseUrl}/schedules/autocomplete?${params}`,
                {
                    headers: { 'Authorization': `Bearer ${await getAccessToken()}` }
                }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const results: NominatimResult[] = await response.json();
            setSuggestions(results);
            setIsOpen(results.length > 0);
        } catch (err) {
            console.error('[Autocomplete]', err);
            setSuggestions([]);
        } finally {
            setLoading(false);
        }
    }

    function handleSelect(result: NominatimResult) {
        const name = formatDisplayName(result.display_name);
        setQuery(name);
        onChange(name);
        setIsOpen(false);
        setSuggestions([]);
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (!isOpen || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSelect(suggestions[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    }

    // Shorten verbose Nominatim display names
    function formatDisplayName(name: string): string {
        const parts = name.split(', ');
        if (parts.length <= 3) return name;
        // Keep first 2 parts + city/state + country
        return [parts[0], parts[1], ...parts.slice(-2)].join(', ');
    }

    const inputClass = "w-full pl-10 pr-10 py-3 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/50 transition-all";

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {icon || <MapPinIcon size={16} />}
                </div>
                <input
                    id={id}
                    type="text"
                    className={inputClass}
                    placeholder={placeholder}
                    value={query}
                    onChange={e => handleInputChange(e.target.value)}
                    onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
                    onKeyDown={handleKeyDown}
                    autoComplete="off"
                    autoFocus={autoFocus}
                />
                {loading && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                        <Loader2Icon size={16} className="animate-spin text-[var(--text-muted)]" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-[var(--card-shadow)] overflow-hidden animate-in fade-in duration-150">
                    {suggestions.map((result, index) => (
                        <button
                            key={result.place_id}
                            type="button"
                            className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer ${
                                index === selectedIndex
                                    ? 'bg-[var(--accent)]/10'
                                    : 'hover:bg-[var(--bg-muted)]'
                            } ${index !== suggestions.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <MapPinIcon size={14} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                    {result.display_name.split(',')[0]}
                                </p>
                                <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">
                                    {result.display_name.split(',').slice(1).join(',').trim()}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
