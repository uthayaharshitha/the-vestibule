'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { updateUserProfile } from '@/lib/user-mutations';

export default function OnboardingProfilePage() {
    const router = useRouter();
    const [pfpFile, setPfpFile] = useState<File | null>(null);
    const [pfpPreview, setPfpPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCurrentUser().then(user => {
            if (!user || user.is_anonymous) router.replace('/login');
        });
    }, [router]);

    const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setError('Profile picture must be under 2 MB'); return; }
        setError(null);
        setPfpFile(file);
        setPfpPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('Banner must be under 5 MB'); return; }
        setError(null);
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleContinue = async () => {
        setSaving(true);
        setError(null);

        if (pfpFile || bannerFile) {
            const { error: saveErr } = await updateUserProfile({
                profileImageFile: pfpFile ?? undefined,
                bannerImageFile: bannerFile ?? undefined,
            });
            if (saveErr) {
                setError(saveErr.message);
                setSaving(false);
                return;
            }
        }

        router.replace('/feed');
    };

    return (
        <main style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1.5rem',
        }}>
            <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 300, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em', margin: 0 }}>
                        Personalize
                    </h1>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                        Optional — you can always change this later
                    </p>
                </div>

                {error && (
                    <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#f87171', textAlign: 'center', border: '1px solid rgba(248,113,113,0.3)', padding: '0.6rem', borderRadius: '4px' }}>
                        {error}
                    </p>
                )}

                {/* Banner upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
                        Banner Image
                    </label>
                    {bannerPreview && (
                        <div style={{ width: '100%', height: '100px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={bannerPreview} alt="Banner preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleBannerChange}
                        style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }} />
                </div>

                {/* PFP upload */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontFamily: 'monospace', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)' }}>
                        Profile Picture
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {pfpPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={pfpPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="rgba(255,255,255,0.2)">
                                    <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                                </svg>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handlePfpChange}
                            style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', flex: 1 }} />
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                        onClick={handleContinue}
                        disabled={saving}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            background: saving ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.9)',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        {saving ? 'Saving…' : (pfpFile || bannerFile) ? 'Save & Continue' : 'Skip for Now'}
                    </button>
                </div>
            </div>
        </main>
    );
}
