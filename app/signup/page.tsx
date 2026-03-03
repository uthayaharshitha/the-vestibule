'use client';

import { useState } from 'react';
import { signUpWithEmail } from '@/lib/auth';
import { checkUsernameAvailable } from '@/lib/user-queries';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState(false);

    const handleUsernameChange = (val: string) => {
        const clean = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(clean);
        setUsernameStatus('idle');
    };

    const handleUsernameBlur = async () => {
        if (!username) return;
        if (!USERNAME_RE.test(username)) { setUsernameStatus('invalid'); return; }
        setUsernameStatus('checking');
        const available = await checkUsernameAvailable(username);
        setUsernameStatus(available ? 'available' : 'taken');
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) { setError('Username is required.'); return; }
        if (!USERNAME_RE.test(username)) { setError('Username must be 3–20 characters: lowercase letters, numbers, underscores only.'); return; }
        if (usernameStatus === 'taken') { setError('That username is already taken.'); return; }

        setLoading(true);
        setError(null);

        const { error: signupError } = await signUpWithEmail(email, password, username);

        if (signupError) {
            setError(signupError.message);
            setLoading(false);
        } else {
            setEmailSent(true);
        }
    };

    const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    };

    const hint = (() => {
        if (usernameStatus === 'checking') return { text: 'Checking…', color: 'var(--text-tertiary)' };
        if (usernameStatus === 'available') return { text: '✓ Available', color: '#16a34a' };
        if (usernameStatus === 'taken') return { text: '✗ Already taken', color: '#dc2626' };
        if (usernameStatus === 'invalid') return { text: '3–20 chars, letters/numbers/underscores only', color: '#dc2626' };
        return null;
    })();

    return (
        <main className="selection:bg-white/20 h-screen w-screen flex flex-col justify-center items-center relative overflow-hidden">
            {/* VHS OVERLAYS */}
            <div className="vhs-static"></div>
            <div className="vhs-lines"></div>
            <div className="vhs-tracking-distortion"></div>
            <div className="vhs-vignette"></div>

            {/* REC Indicator */}
            <div className="fixed top-8 right-12 z-50 flex items-center space-x-3 text-xl tracking-widest text-red-600 opacity-80 font-mono" style={{ animation: 'vhs-flicker 0.2s infinite alternate' }}>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span>REC</span>
            </div>

            {/* PLAY SP Indicator */}
            <div className="fixed top-8 left-12 z-50 text-lg text-white/40 flex flex-col items-start leading-none opacity-80 font-mono">
                <span>PLAY</span>
                <span className="text-xs opacity-50 mt-1">SP</span>
            </div>

            {/* Timestamp */}
            <div className="fixed bottom-8 left-12 z-50 text-2xl tracking-tighter text-white/80 flex flex-col items-start opacity-90 font-mono">
                <span className="vhs-chromatic-aberration">01-03-2026</span>
                <span className="vhs-chromatic-aberration">05:34:00</span>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-md vhs-screen-jitter">

                {emailSent ? (
                    /* ── Email sent confirmation ── */
                    <>
                        <div className="mb-6 text-4xl">✉️</div>
                        <h1 className="text-3xl md:text-4xl font-semibold mb-3 vhs-chromatic-aberration opacity-90 font-sans">
                            Check Your Email
                        </h1>
                        <p className="font-mono text-sm text-white/50 mb-4 leading-relaxed">
                            A confirmation link has been sent to<br />
                            <span className="text-white/80">{email}</span>
                        </p>
                        <p className="font-mono text-xs text-white/30 tracking-wider">
                            Click the link to confirm your account.<br />
                            You&apos;ll be asked to set a profile picture after.
                        </p>
                        <Link href="/login" className="mt-8 font-mono text-xs text-white/30 underline hover:text-white/60 transition-colors">
                            Back to Sign In
                        </Link>
                    </>
                ) : (
                    /* ── Signup form ── */
                    <>
                        <h1 className="text-4xl md:text-6xl font-semibold mb-2 vhs-chromatic-aberration opacity-90 blur-[0.3px] font-sans">
                            Begin Journey
                        </h1>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8">
                            Create a private account
                        </p>

                        <form className="w-full space-y-3 font-mono" onSubmit={handleSignup}>
                            {error && (
                                <div className="text-red-400 text-xs text-center border border-red-500/30 bg-red-500/10 p-3 rounded-md tracking-wider mb-4">
                                    {error}
                                </div>
                            )}

                            {/* Username */}
                            <div className="relative w-full">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 text-sm pointer-events-none">@</span>
                                <input
                                    type="text"
                                    required
                                    maxLength={20}
                                    className={`w-full bg-black/40 border ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500/50' : 'border-white/10'} text-white placeholder:text-white/30 pl-[3.25rem] pr-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-left uppercase`}
                                    placeholder="YOURNAME"
                                    value={username}
                                    onChange={(e) => handleUsernameChange(e.target.value)}
                                    onBlur={handleUsernameBlur}
                                />
                            </div>
                            {hint && (
                                <p className="text-[10px] tracking-wider text-left pl-2 mt-1" style={{ color: hint.color }}>{hint.text}</p>
                            )}

                            <input
                                type="email"
                                required
                                className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 px-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-center uppercase"
                                placeholder="EMAIL ADDRESS"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <input
                                type="password"
                                required
                                minLength={6}
                                className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 px-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-center uppercase"
                                placeholder="PASSWORD (MIN 6 CHARS)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid'}
                                    className="vhs-button w-full py-4 px-8 bg-white/5 border border-white/20 text-lg uppercase tracking-[0.2em] text-white hover:border-white/40 disabled:opacity-50"
                                >
                                    {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-3 py-1">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="font-mono text-[10px] tracking-widest text-white/30 uppercase">or</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            {/* Google */}
                            <button
                                type="button"
                                onClick={handleGoogle}
                                className="vhs-button w-full py-3 px-8 border border-white/15 text-sm uppercase tracking-[0.15em] text-white/70 hover:text-white hover:border-white/30 flex items-center justify-center gap-3"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Continue with Google
                            </button>

                            <Link href="/login" className="vhs-button w-full py-3 px-8 border border-white/10 text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white hover:border-white/30 mt-1 block text-center">
                                ALREADY HAVE AN ACCOUNT? SIGN IN
                            </Link>
                        </form>

                        <footer className="mt-16 flex space-x-6 text-[0.65rem] uppercase tracking-[0.2em] text-white/30 font-mono">
                            <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
                            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
                            <Link href="/copyright-policy" className="hover:text-white/60 transition-colors">Copyright</Link>
                        </footer>
                    </>
                )}
            </div>

            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-20 bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"></div>
        </main>
    );
}
