'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getCapsulesBySearchTerm, searchCapsulesByTag } from '@/lib/search';
import { Capsule } from '@/types/database';
import CapsuleCard from '@/components/CapsuleCard';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    // Support ?q= for general search and ?tag= for specific tag search
    const query = searchParams.get('q');
    const tag = searchParams.get('tag');

    const [results, setResults] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            setResults([]);

            if (tag) {
                const { capsules } = await searchCapsulesByTag(tag);
                if (capsules) setResults(capsules);
            } else if (query) {
                const { capsules } = await getCapsulesBySearchTerm(query);
                if (capsules) setResults(capsules);
            }

            setLoading(false);
        };

        if (query || tag) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query, tag]);

    return (
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                <Link href="/feed" style={{ color: 'var(--text-tertiary)', textDecoration: 'none' }} className="hover:opacity-70 transition-opacity">Feed</Link>
                <span>/</span>
                <span>Search</span>
            </div>

            <h1 style={{ fontSize: '1.875rem', fontWeight: 300, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                {tag ? (
                    <>Capsules in <span style={{ fontWeight: 500 }}>{tag}</span></>
                ) : query ? (
                    <>Results for &ldquo;{query}&rdquo;</>
                ) : (
                    'Search'
                )}
            </h1>

            {loading ? (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>Searching the void...</div>
            ) : results.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
                    {results.map(capsule => (
                        <CapsuleCard key={capsule.id} capsule={capsule} />
                    ))}
                </div>
            ) : (
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <p>No echoes found matching your signal.</p>
                    <div style={{ marginTop: '2rem' }}>
                        <Link href="/feed" style={{ color: 'var(--text-main)', textDecoration: 'underline', fontSize: '0.875rem' }}>Return to Feed</Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-main)', padding: '3rem 1rem' }}>
            <Suspense fallback={
                <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                    Searching the void...
                </div>
            }>
                <SearchResults />
            </Suspense>
        </main>
    );
}
