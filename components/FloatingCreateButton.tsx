'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';

export default function FloatingCreateButton() {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setIsAuthenticated(!!user && !user.is_anonymous);
        });
    }, [pathname]);

    // Don't show on inappropriate pages or for guests
    if (
        !isAuthenticated ||
        pathname === '/create-capsule' ||
        pathname === '/login' ||
        pathname === '/' ||
        pathname?.startsWith('/capsule/') ||
        pathname?.startsWith('/edit-capsule/')
    ) {
        return null;
    }

    return (
        <Link
            href="/create-capsule"
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-black text-white rounded-md border border-white/20 hover:bg-gray-800 transition-transform hover:scale-105"
            aria-label="Create Capsule"
        >
            <span className="text-2xl font-light pb-1">+</span>
        </Link>
    );
}
