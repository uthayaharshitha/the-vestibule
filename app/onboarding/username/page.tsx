'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { checkUsernameAvailable } from '@/lib/user-queries';
import { supabase } from '@/lib/supabase';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function OnboardingUsernamePage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCurrentUser().then(user => {
            if (!user || user.is_anonymous) router.replace('/login');
        });
    }, [router]);

    const handleChange = (val: string) => {
        const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(clean);
        setStatus('idle');
        setError(null);
    };

    const handleBlur = async () => {
        if (!username) return;
        if (!USERNAME_RE.test(username)) { setStatus('invalid'); return; }
        setStatus('checking');
        const available = await checkUsernameAvailable(username);
        setStatus(available ? 'available' : 'taken');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) { setError('Username is required.'); return; }
        if (!USERNAME_RE.test(username)) { setError('3–20 chars, lowercase letters, numbers, underscores only.'); return; }
        if (status === 'taken') { setError('That username is already taken.'); return; }

        // Double-check availability
        if (status !== 'available') {
            setStatus('checking');
            const ok = await checkUsernameAvailable(username);
            if (!ok) { setStatus('taken'); setError('That username is already taken.'); return; }
            setStatus('available');
        }

        setSaving(true);
        setError(null);

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError('Session expired. Please sign in again.'); setSaving(false); return; }

        const { error: saveErr } = await supabase
            .from('users')
            .update({ username: username.toLowerCase().trim() })
            .eq('id', session.user.id);

        if (saveErr) {
            setError('Failed to save username. Please try again.');
            setSaving(false);
            return;
        }

        router.replace('/onboarding/profile');
    };

    const hint = (() => {
        if (status === 'checking') return { text: 'Checking…', color: 'rgba(255,255,255,0.4)' };
        if (status === 'available') return { text: '✓ Available', color: '#4ade80' };
        if (status === 'taken') return { text: '✗ Already taken', color: '#f87171' };
        if (status === 'invalid') return { text: '3–20 chars, lowercase letters, numbers, underscores only', color: '#f87171' };
        return null;
    })();

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
            <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontFamily: 'monospace', fontSize: '1.75rem', fontWeight: 300, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.04em', margin: 0 }}>
                        Choose a Username
                    </h1>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', marginTop: '0.5rem' }}>
                        This is how others will find you
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {error && (
                        <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', padding: '0.6rem 0.75rem', borderRadius: '4px', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    {/* Username input */}
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', fontSize: '0.875rem', pointerEvents: 'none' }}>@</span>
                        <input
                            type="text"
                            autoFocus
                            required
                            maxLength={20}
                            value={username}
                            onChange={e => handleChange(e.target.value)}
                            onBlur={handleBlur}
                            placeholder="YOURNAME"
                            style={{
                                width: '100%',
                                background: 'rgba(255,255,255,0.04)',
                                border: `1px solid ${status === 'taken' || status === 'invalid' ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                                color: 'rgba(255,255,255,0.9)',
                                padding: '0.9rem 1rem 0.9rem 2.25rem',
                                fontFamily: 'monospace',
                                fontSize: '0.875rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                outline: 'none',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>

                    {hint && (
                        <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', letterSpacing: '0.08em', color: hint.color, margin: 0, paddingLeft: '0.25rem' }}>
                            {hint.text}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={saving || status === 'taken' || status === 'invalid' || !username}
                        style={{
                            width: '100%',
                            padding: '0.9rem',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'rgba(255,255,255,0.9)',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            cursor: saving || status === 'taken' || status === 'invalid' || !username ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            opacity: saving || !username ? 0.5 : 1,
                            marginTop: '0.5rem',
                        }}
                    >
                        {saving ? 'Saving…' : 'Continue →'}
                    </button>
                </form>
            </div>
        </main>
    );
}
