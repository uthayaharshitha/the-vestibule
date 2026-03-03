'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getCurrentUserProfile } from '@/lib/user-queries';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '@/lib/auth';
import Link from 'next/link';

export default function MyJourneyLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [displayName, setDisplayName] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [avatarZoom, setAvatarZoom] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const user = await getCurrentUser();
            if (!user) {
                router.push('/login');
                return;
            }
            const profileData = await getCurrentUserProfile();
            setProfile(profileData);
            if (profileData?.username) {
                setDisplayName(`@${profileData.username}`);
            } else {
                setDisplayName(user.email || 'Anonymous');
            }
            setLoading(false);
        };
        checkAuth();
    }, [router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-mono text-sm" style={{ background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                [ Loading... ]
            </div>
        );
    }

    const tabs = [
        { href: '/my-journey/capsules', label: 'Created Capsules' },
        { href: '/my-journey/comments', label: 'Comments / Traces' },
        { href: '/my-journey/saved', label: 'Saved' },
    ];

    const bannerBg = profile?.banner_image_url
        ? `url(${profile.banner_image_url})`
        : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';

    return (
        <main className="min-h-screen font-mono" style={{ background: 'var(--bg-main)' }}>

            {/* ── Banner ── */}
            <div style={{
                width: '100%',
                height: '180px',
                backgroundImage: bannerBg,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }} />

            {/* ── Profile header ── */}
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
                <div style={{ position: 'relative', marginTop: '-44px', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    {/* Avatar — clickable to zoom */}
                    <button
                        onClick={() => profile?.profile_image_url && setAvatarZoom(true)}
                        style={{
                            width: '88px',
                            height: '88px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '3px solid var(--bg-main)',
                            background: 'var(--bg-secondary)',
                            flexShrink: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: profile?.profile_image_url ? 'zoom-in' : 'default',
                            padding: 0,
                        }}
                    >
                        {profile?.profile_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.profile_image_url} alt={profile?.username || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg width="40" height="40" viewBox="0 0 20 20" fill="var(--text-tertiary)">
                                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                            </svg>
                        )}
                    </button>

                    {/* Actions */}
                    <div className="flex gap-4 text-xs font-medium items-center pb-1">
                        <Link href="/feed" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                            [ Back to Feed ]
                        </Link>
                        <Link href="/profile/edit" className="hover:underline" style={{ color: 'var(--text-secondary)' }}>
                            [ Edit Profile ]
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="hover:underline"
                            style={{ color: 'var(--text-secondary)' }}
                        >
                            [ Sign Out ]
                        </button>
                    </div>
                </div>

                {/* Name */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                    <h1 className="text-xl font-bold uppercase tracking-widest" style={{ color: 'var(--text-main)' }}>
                        My Journey
                    </h1>
                    <p className="mt-1 text-xs uppercase" style={{ color: 'var(--text-secondary)' }}>
                        {displayName}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 mb-8 pb-0" style={{ borderBottom: `1px solid var(--border-color)` }}>
                    {tabs.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className="pb-2 text-sm font-bold uppercase tracking-wide border-b-2 transition-colors"
                            style={{
                                borderColor: pathname === href ? 'var(--text-main)' : 'transparent',
                                color: pathname === href ? 'var(--text-main)' : 'var(--text-tertiary)',
                            }}
                        >
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="py-4">{children}</div>
            </div>

            {/* ── Avatar Lightbox ── */}
            {avatarZoom && profile?.profile_image_url && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.92)',
                        zIndex: 9000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    onClick={() => setAvatarZoom(false)}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'none',
                            border: 'none',
                            color: '#fff',
                            fontSize: '32px',
                            cursor: 'pointer',
                            lineHeight: 1,
                        }}
                        onClick={() => setAvatarZoom(false)}
                    >
                        ×
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={profile.profile_image_url}
                        alt="Profile"
                        style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </main>
    );
}
