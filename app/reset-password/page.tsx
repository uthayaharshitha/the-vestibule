'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionReady, setSessionReady] = useState(false);

    // Supabase puts the access token in the URL hash on redirect.
    // We need to let the client pick it up before doing anything.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY' && session) {
                setSessionReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setDone(true);
            setTimeout(() => router.push('/login'), 2500);
        }
    };

    return (
        <main className="selection:bg-white/20 h-screen w-screen flex flex-col justify-center items-center relative overflow-hidden">
            {/* VHS OVERLAYS */}
            <div className="vhs-static"></div>
            <div className="vhs-lines"></div>
            <div className="vhs-tracking-distortion"></div>
            <div className="vhs-vignette"></div>

            <div className="fixed top-8 right-12 z-50 flex items-center space-x-3 text-xl tracking-widest text-red-600 opacity-80 font-mono" style={{ animation: 'vhs-flicker 0.2s infinite alternate' }}>
                <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                <span>REC</span>
            </div>

            <div className="fixed top-8 left-12 z-50 text-lg text-white/40 flex flex-col items-start leading-none opacity-80 font-mono">
                <span>PLAY</span>
                <span className="text-xs opacity-50 mt-1">SP</span>
            </div>

            <div className="fixed bottom-8 left-12 z-50 text-2xl tracking-tighter text-white/80 flex flex-col items-start opacity-90 font-mono">
                <span className="vhs-chromatic-aberration">01-03-2026</span>
                <span className="vhs-chromatic-aberration">05:34:00</span>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-md vhs-screen-jitter">
                <h1 className="text-4xl md:text-5xl font-semibold mb-2 vhs-chromatic-aberration opacity-90 blur-[0.3px] font-sans">
                    Rewrite Protocol
                </h1>

                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8">
                    Set a new security key
                </p>

                {done ? (
                    <div className="w-full text-center space-y-4 font-mono">
                        <div className="text-4xl mb-4 text-[#00f0ff] about-flicker">■</div>
                        <p className="text-white text-sm uppercase tracking-widest">
                            Rewrite Complete
                        </p>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-6 leading-relaxed">
                            Redirecting to terminal...
                        </p>
                    </div>
                ) : !sessionReady ? (
                    <div className="w-full text-center space-y-4 font-mono">
                        <p className="text-white/50 text-sm uppercase tracking-widest animate-pulse">
                            Establishing Handshake...
                        </p>
                        <p className="text-white/30 text-[10px] uppercase tracking-wider mt-4">
                            If stalled, transmission expired.<br />
                            <Link href="/forgot-password" className="text-white border-b border-white hover:text-[#00f0ff] hover:border-[#00f0ff] transition-colors pb-0.5 mt-2 inline-block">
                                REQUEST NEW KEY
                            </Link>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full space-y-3 font-mono">
                        {error && (
                            <div className="text-red-400 text-xs text-center border border-red-500/30 bg-red-500/10 p-3 rounded-md tracking-wider mb-4">
                                {error}
                            </div>
                        )}

                        <input
                            type="password"
                            required
                            minLength={6}
                            className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 px-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-center uppercase"
                            placeholder="NEW PASSWORD (MIN 6 CHARS)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <input
                            type="password"
                            required
                            className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 px-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-center uppercase"
                            placeholder="CONFIRM NEW PASSWORD"
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                        />

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="vhs-button w-full py-4 px-8 bg-white/5 border border-white/20 text-sm uppercase tracking-[0.2em] text-white hover:border-white/40 disabled:opacity-50"
                            >
                                {loading ? 'UPDATING...' : 'ENCODE NEW KEY'}
                            </button>
                        </div>
                    </form>
                )}

                <footer className="mt-16 flex space-x-6 text-[0.65rem] uppercase tracking-[0.2em] text-white/30 font-mono">
                    <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
                    <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
                    <Link href="/copyright-policy" className="hover:text-white/60 transition-colors">Copyright</Link>
                </footer>
            </div>

            <div className="fixed inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-20 bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"></div>
        </main>
    );
}
