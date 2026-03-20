'use client';

import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SearchBar from './SearchBar';
import { getRandomCapsule } from '@/lib/capsule-queries';
import { useReadMode } from '@/contexts/ReadModeContext';
import { useUnsavedChangesContext } from '@/contexts/UnsavedChangesContext';

export default function AppHeader() {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();
    const router = useRouter();
    const [isDrifting, setIsDrifting] = useState(false);
    const { isReadMode } = useReadMode();
    const [menuOpen, setMenuOpen] = useState(false);
    const { confirmNavigation } = useUnsavedChangesContext();

    useEffect(() => {
        getCurrentUser().then(setUser);
    }, [pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    const handleDrift = () => {
        confirmNavigation(async () => {
            setIsDrifting(true);
            setMenuOpen(false);
            const { capsule } = await getRandomCapsule();
            if (capsule) {
                router.push(`/capsule/${capsule.id}`);
            }
            setIsDrifting(false);
        });
    };

    // Don't show header on login/signup/landing pages
    if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
        return null;
    }

    // Don't show header in Read Mode
    if (isReadMode) {
        return null;
    }

    const navLinkStyle = { color: 'var(--header-text-override, #71717a)' };
    const navClass = 'transition-colors hover:text-white text-[9px] uppercase tracking-[0.2em] font-bold font-mono';

    return (
        <header
            className="sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
            style={{
                backgroundColor: 'var(--header-bg-override, rgba(5,5,5,0.95))',
                borderColor: 'var(--header-border-override, rgba(255,255,255,0.1))'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link href="/feed" className="flex items-center gap-4 group flex-shrink-0">
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

                {/* Desktop nav (hidden on mobile) */}
                <div className="hidden sm:flex items-center gap-8">
                    <nav className="flex items-center gap-6 text-[9px] uppercase tracking-[0.2em] font-bold font-mono">
                        <button
                            onClick={handleDrift}
                            disabled={isDrifting}
                            className="transition-colors hover:text-white disabled:opacity-40"
                            style={navLinkStyle}
                        >
                            {isDrifting ? 'SYNCHRONIZING...' : 'DRIFT'}
                        </button>

                        <Link href="/about" className="transition-colors hover:text-white" style={navLinkStyle}>ABOUT</Link>

                        {user && !user.is_anonymous ? (
                            <Link href="/my-journey" className="transition-colors hover:text-white" style={navLinkStyle}>MY JOURNEY</Link>
                        ) : (
                            <Link href="/login" className="transition-colors hover:text-white" style={navLinkStyle}>SIGN IN</Link>
                        )}
                    </nav>

                    <div className="hidden lg:block opacity-80 hover:opacity-100 transition-opacity">
                        <SearchBar />
                    </div>
                </div>

                {/* Mobile hamburger button (visible only on mobile) */}
                <button
                    className="sm:hidden flex flex-col justify-center items-center gap-[5px] w-11 h-11 rounded"
                    onClick={() => setMenuOpen(prev => !prev)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                    style={{ color: 'var(--header-text-override, #71717a)', background: 'none', border: 'none', cursor: 'pointer', touchAction: 'manipulation' }}
                >
                    {menuOpen ? (
                        /* X icon when open */
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M4 4l12 12M16 4L4 16" />
                        </svg>
                    ) : (
                        /* Hamburger icon when closed */
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M3 5h14M3 10h14M3 15h14" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Mobile dropdown menu */}
            <div
                style={{
                    maxHeight: menuOpen ? '400px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                    borderTop: menuOpen ? '1px solid var(--header-border-override, rgba(255,255,255,0.1))' : 'none',
                    backgroundColor: 'var(--header-bg-override, rgba(5,5,5,0.98))',
                }}
            >
                <div className="px-4 py-4 flex flex-col gap-5">
                    {/* Search */}
                    <div className="opacity-80">
                        <SearchBar />
                    </div>

                    {/* Nav links */}
                    <nav className="flex flex-col gap-4">
                        <button
                            onClick={handleDrift}
                            disabled={isDrifting}
                            className={navClass}
                            style={{ ...navLinkStyle, textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', minHeight: '44px' }}
                        >
                            {isDrifting ? 'SYNCHRONIZING...' : 'DRIFT'}
                        </button>

                        <Link href="/about" className={navClass} style={{ ...navLinkStyle, padding: '8px 0', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                            ABOUT
                        </Link>

                        {user && !user.is_anonymous ? (
                            <Link href="/my-journey" className={navClass} style={{ ...navLinkStyle, padding: '8px 0', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                MY JOURNEY
                            </Link>
                        ) : (
                            <Link href="/login" className={navClass} style={{ ...navLinkStyle, padding: '8px 0', minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                                SIGN IN
                            </Link>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
