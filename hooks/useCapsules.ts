'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCapsules } from '@/lib/capsule-queries';
import { Capsule } from '@/types/database';

// Fisher-Yates shuffle — true unbiased random order
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function useCapsules() {
    const [capsules, setCapsules] = useState<Capsule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setCapsules([]);
            const { capsules: data, error } = await getCapsules(500);

            if (error) {
                setError('Failed to load capsules');
                setLoading(false);
                return;
            }

            // Shuffle for randomness
            setCapsules(shuffle(data));
            setLoading(false);
        };
        load();
    }, []);

    // hasMore / loadMore kept for CapsuleFeed compatibility
    const hasMore = false;
    const loadMore = useCallback(() => { }, []);

    return { capsules, loading, hasMore, error, loadMore };
}
