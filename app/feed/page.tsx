'use client';

import CapsuleFeed from '@/components/CapsuleFeed';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function FeedPage() {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkAuth();
    }, [router]);

    // Restore scroll position
    useEffect(() => {
        if (!loading) {
            const savedScrollY = sessionStorage.getItem('feedScrollY');
            if (savedScrollY) {
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                    window.scrollTo(0, parseInt(savedScrollY));
                    sessionStorage.removeItem('feedScrollY');
                }, 100);
            }
        }
    }, [loading]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)', color: 'var(--text-tertiary)' }}>Loading...</div>;
    }

    return (
        <main className="min-h-screen relative overflow-x-hidden text-gray-300">
            {/* Archive Mode Subtle Grain */}
            <div className="grain-subtle"></div>

            <CapsuleFeed />
        </main>
    );
}
