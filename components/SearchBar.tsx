'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery(''); // Optional: clear after search
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative">
            <input
                type="text"
                placeholder="EXPLORE..."
                className="w-48 sm:w-64 bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-main)] text-sm rounded-md pl-4 pr-10 py-1.5 focus:outline-none focus:border-[var(--text-secondary)] transition-colors font-mono uppercase tracking-widest placeholder-[var(--text-tertiary)]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </form>
    );
}
