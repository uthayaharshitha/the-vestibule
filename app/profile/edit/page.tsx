'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOut } from '@/lib/auth';
import { getCurrentUserProfile } from '@/lib/user-queries';
import { updateUserProfile } from '@/lib/user-mutations';
import { checkUsernameAvailable } from '@/lib/user-queries';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function ProfileEditPage() {
    const router = useRouter();
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [currentUsername, setCurrentUsername] = useState<string | null>(null);
    const [currentPfpUrl, setCurrentPfpUrl] = useState<string | null>(null);
    const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);

    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'same'>('idle');
    const [pfpFile, setPfpFile] = useState<File | null>(null);
    const [pfpPreview, setPfpPreview] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isDirty = !loading && !saving && (
        username !== currentUsername ||
        pfpFile !== null ||
        bannerFile !== null
    );
    useUnsavedChanges(isDirty);

    useEffect(() => {
        const init = async () => {
            const user = await getCurrentUser();
            if (!user || user.is_anonymous) { router.replace('/login'); return; }
            const profile = await getCurrentUserProfile();
            if (profile) {
                setCurrentUsername(profile.username);
                setUsername(profile.username || '');
                setCurrentPfpUrl(profile.profile_image_url);
                setCurrentBannerUrl(profile.banner_image_url);
            }
            setLoading(false);
        };
        init();
    }, [router]);

    const handleUsernameChange = (val: string) => {
        const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(clean);
        setUsernameStatus('idle');
    };

    const handleUsernameBlur = async () => {
        if (!username) return;
        if (username === currentUsername) { setUsernameStatus('same'); return; }
        if (!USERNAME_RE.test(username)) { setUsernameStatus('invalid'); return; }
        setUsernameStatus('checking');
        const available = await checkUsernameAvailable(username);
        setUsernameStatus(available ? 'available' : 'taken');
    };

    const handlePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { setError('Profile picture must be under 2 MB'); return; }
        setPfpFile(file);
        setPfpPreview(URL.createObjectURL(file));
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setError('Banner must be under 5 MB'); return; }
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (usernameStatus === 'taken' || usernameStatus === 'invalid') return;

        setSaving(true);
        setError(null);

        const updates: { username?: string; profileImageFile?: File; bannerImageFile?: File } = {};
        if (username && username !== currentUsername) updates.username = username;
        if (pfpFile) updates.profileImageFile = pfpFile;
        if (bannerFile) updates.bannerImageFile = bannerFile;

        if (Object.keys(updates).length === 0) {
            showToast('Nothing to update.');
            setSaving(false);
            return;
        }

        const { error: saveErr } = await updateUserProfile(updates);

        if (saveErr) {
            setError(saveErr.message);
            setSaving(false);
            return;
        }

        showToast('Profile updated.');
        const target = updates.username || currentUsername;
        if (target) router.push(`/profile/${target}`);
        else router.push('/feed');
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            'Are you sure you want to delete your account?\n\nThis is permanent — your account, username, and profile will be removed. Your capsules and contributions will remain but will be anonymised.'
        );
        if (!confirmed) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError('Not signed in.'); return; }

        const res = await fetch('/api/delete-account', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setError(body.error || 'Failed to delete account. Please try again.');
            return;
        }

        await signOut();
        router.replace('/');
    };

    const labelStyle: React.CSSProperties = {
        display: 'block',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '0.4rem',
    };

    if (loading) return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Loading…</p>
        </main>
    );

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingBottom: '4rem' }}>
            <div style={{ maxWidth: '520px', margin: '0 auto', padding: '2.5rem 1.5rem 0' }}>
                <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
                    Profile
                </p>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-main)', marginBottom: '2rem' }}>
                    Edit Profile
                </h1>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {error && (
                        <div style={{ background: 'rgba(220,38,38,0.08)', color: '#dc2626', padding: '0.6rem 0.875rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    {/* Banner upload */}
                    <div>
                        <label style={labelStyle}>Banner Image <span style={{ color: 'var(--text-tertiary)' }}>(optional, max 5 MB)</span></label>
                        {(bannerPreview || currentBannerUrl) && (
                            <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.75rem', background: 'var(--bg-secondary)' }}>
                                <img
                                    src={bannerPreview || currentBannerUrl || ''}
                                    alt="Banner preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleBannerChange} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                    </div>

                    {/* PFP upload */}
                    <div>
                        <label style={labelStyle}>Profile Picture <span style={{ color: 'var(--text-tertiary)' }}>(optional, max 2 MB)</span></label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: '64px', height: '64px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {(pfpPreview || currentPfpUrl) ? (
                                    <img src={pfpPreview || currentPfpUrl || ''} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 20 20" fill="var(--text-tertiary)">
                                        <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                                    </svg>
                                )}
                            </div>
                            <input type="file" accept="image/*" onChange={handlePfpChange} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label style={labelStyle}>Username</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: '0.875rem', pointerEvents: 'none' }}>@</span>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => handleUsernameChange(e.target.value)}
                                onBlur={handleUsernameBlur}
                                maxLength={20}
                                className="archive-input !pl-8"
                            />
                        </div>
                        {usernameStatus === 'checking' && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Checking…</p>}
                        {usernameStatus === 'available' && <p style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>✓ Available</p>}
                        {usernameStatus === 'taken' && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>✗ Already taken</p>}
                        {usernameStatus === 'invalid' && <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>3–20 chars, lowercase letters/numbers/underscores only</p>}
                        {usernameStatus === 'same' && <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>This is your current username</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
                                router.back();
                            }}
                            className="archive-btn opacity-60 hover:opacity-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                            className="archive-btn"
                        >
                            {saving ? 'SAVING...' : 'SAVE CHANGES'}
                        </button>
                    </div>
                </form>

                {/* ── Danger Zone ── */}
                <div style={{
                    marginTop: '3rem',
                    padding: '1.25rem',
                    border: '1px solid rgba(220,38,38,0.25)',
                    borderRadius: '8px',
                    background: 'rgba(220,38,38,0.04)',
                }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 0.35rem' }}>Danger Zone</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem' }}>
                        Permanently delete your account. Your username will be released and your profile will be removed. This cannot be undone.
                    </p>
                    <button
                        type="button"
                        onClick={handleDeleteAccount}
                        style={{
                            padding: '0.5rem 1.1rem',
                            background: 'transparent',
                            border: '1px solid rgba(220,38,38,0.5)',
                            borderRadius: '6px',
                            color: '#dc2626',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Delete Account
                    </button>
                </div>
            </div>
        </main>
    );
}
