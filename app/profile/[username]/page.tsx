'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getUserByUsername, getCapsulesByUserId, UserProfile } from '@/lib/user-queries';
import { getCurrentUser } from '@/lib/auth';
import CapsuleCard from '@/components/CapsuleCard';
import Link from 'next/link';

const DEFAULT_BANNER = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';

export default function ProfilePage() {
    const params = useParams();
    const username = typeof params.username === 'string' ? params.username : '';

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [capsules, setCapsules] = useState<any[]>([]);
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [avatarZoom, setAvatarZoom] = useState(false);

    useEffect(() => {
        const load = async () => {
            const [profileData, currentUser] = await Promise.all([
                getUserByUsername(username),
                getCurrentUser(),
            ]);

            if (!profileData) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            setProfile(profileData);
            setIsOwnProfile(currentUser?.id === profileData.id);

            const { capsules: caps } = await getCapsulesByUserId(profileData.id);
            setCapsules(caps);
            setLoading(false);
        };
        if (username) load();
    }, [username]);

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading profile…</p>
            </main>
        );
    }

    if (notFound || !profile) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'var(--text-main)', fontSize: '1.25rem', fontWeight: 300 }}>Profile not found</p>
                <Link href="/feed" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Back to feed</Link>
            </main>
        );
    }

    const joinYear = new Date(profile.created_at).getFullYear();

    return (
        <>
            <main style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingBottom: '4rem' }}>
                {/* Banner */}
                <div style={{
                    width: '100%',
                    height: '220px',
                    background: profile.banner_image_url ? undefined : DEFAULT_BANNER,
                    backgroundImage: profile.banner_image_url ? `url(${profile.banner_image_url})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                }} />

                {/* Profile header */}
                <div style={{ maxWidth: '720px', margin: '0 auto', padding: '0 1.5rem' }}>
                    {/* Avatar — overlaps banner */}
                    <div style={{ position: 'relative', marginTop: '-44px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <button
                            onClick={() => profile.profile_image_url && setAvatarZoom(true)}
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
                                cursor: profile.profile_image_url ? 'zoom-in' : 'default',
                                padding: 0,
                            }}
                        >
                            {profile.profile_image_url ? (
                                <img src={profile.profile_image_url} alt={profile.username || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <svg width="40" height="40" viewBox="0 0 20 20" fill="var(--text-tertiary)">
                                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                                </svg>
                            )}
                        </button>

                        {isOwnProfile && (
                            <Link
                                href="/profile/edit"
                                style={{
                                    padding: '0.4rem 1rem',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    background: 'var(--bg-secondary)',
                                    fontSize: '0.8rem',
                                    textDecoration: 'none',
                                }}
                            >
                                Edit Profile
                            </Link>
                        )}
                    </div>

                    {/* Identity */}
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                        @{profile.username}
                    </h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
                        Joined {joinYear} · {capsules.length} {capsules.length === 1 ? 'capsule' : 'capsules'}
                    </p>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--border-color)', marginBottom: '2rem' }} />

                    {/* Capsule grid */}
                    {capsules.length === 0 ? (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>No capsules yet.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                            {capsules.map((c, i) => (
                                <CapsuleCard key={c.id} capsule={c} revealDelay={i * 40} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* ── Avatar Lightbox ── */}
            {
                avatarZoom && profile && profile.profile_image_url && (
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
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '32px', cursor: 'pointer', lineHeight: 1 }}
                            onClick={() => setAvatarZoom(false)}
                        >
                            ×
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={profile.profile_image_url!}
                            alt="Profile"
                            style={{ maxWidth: '80vw', maxHeight: '80vh', borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 60px rgba(0,0,0,0.8)' }}
                            onClick={e => e.stopPropagation()}
                        />
                    </div>
                )
            }
        </>
    );
}
