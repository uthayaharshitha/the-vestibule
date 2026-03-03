'use client';

import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { getRandomCapsule } from '@/lib/capsule-queries';
import { useReadMode } from '@/contexts/ReadModeContext';

export default function AppHeader() {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isDrifting, setIsDrifting] = useState(false);
    const { isReadMode } = useReadMode();

    useEffect(() => {
        getCurrentUser().then(setUser);
    }, [pathname]);

    const handleDrift = async () => {
        setIsDrifting(true);
        const { capsule } = await getRandomCapsule();
        if (capsule) {
            router.push(`/capsule/${capsule.id}`);
        }
        setIsDrifting(false);
    };

    // Don't show header on login/signup/landing pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
        return null;
    }

    // Don't show header in Read Mode
    if (isReadMode) {
        return null;
    }

    return (
        <header
            className="sticky top-0 z-50 backdrop-blur-md border-b px-6 py-4 transition-colors duration-300"
            style={{
                backgroundColor: 'var(--header-bg-override, rgba(5,5,5,0.95))',
                borderColor: 'var(--header-border-override, rgba(255,255,255,0.1))'
            }}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-4 group">
                    <div className="vestibular-logo text-white/80 group-hover:text-white transition-colors">
                        <div className="ring ring-1"></div>
                        <div className="ring ring-2"></div>
                        <div className="ring ring-3"></div>
                        <div className="canal-line"></div>
                    </div>
                    <div className="flex flex-col leading-none pl-3 border-l pr-2" style={{ borderColor: 'var(--header-border-override, rgba(255,255,255,0.2))' }}>
                        <span className="text-[14px] font-black tracking-tighter" style={{ color: 'var(--header-text-override, white)' }}>
                            THE VESTIBULE
                        </span>
                    </div>
                </Link>

                <div className="flex items-center gap-8">
                    <nav className="flex items-center gap-6 text-[9px] uppercase tracking-[0.2em] font-bold font-mono">
                        <button
                            onClick={handleDrift}
                            disabled={isDrifting}
                            className="transition-colors hover:text-white disabled:opacity-40"
                            style={{ color: 'var(--header-text-override, #71717a)' }}
                        >
                            {isDrifting ? 'SYNCHRONIZING...' : 'DRIFT'}
                        </button>

                        <Link
                            href="/about"
                            className="transition-colors hover:text-white"
                            style={{ color: 'var(--header-text-override, #71717a)' }}
                        >
                            ABOUT
                        </Link>

                        {user && !user.is_anonymous ? (
                            <Link
                                href="/my-journey"
                                className="transition-colors hover:text-white"
                                style={{ color: 'var(--header-text-override, #71717a)' }}
                            >
                                MY JOURNEY
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="transition-colors hover:text-white"
                                style={{ color: 'var(--header-text-override, #71717a)' }}
                            >
                                SIGN IN
                            </Link>
                        )}
                    </nav>

                    <div className="hidden lg:block opacity-80 hover:opacity-100 transition-opacity">
                        <SearchBar />
                    </div>
                </div>
            </div>
        </header>
    );
}
