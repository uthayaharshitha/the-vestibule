'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            setSent(true);
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
                <h1 className="text-4xl md:text-6xl font-semibold mb-2 vhs-chromatic-aberration opacity-90 blur-[0.3px] font-sans">
                    Reset Password
                </h1>

                <p className="font-mono text-[10px] uppercase tracking-widest text-white/40 mb-8">
                    Enter your email to receive a secure link
                </p>

                {sent ? (
                    <div className="w-full text-center space-y-4 font-mono">
                        <div className="text-4xl mb-4 text-[#00f0ff] about-flicker">■</div>
                        <p className="text-white text-sm uppercase tracking-widest">
                            Connection Established
                        </p>
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-6 leading-relaxed">
                            A reset link was sent to<br />
                            <span className="text-white">[{email}]</span><br /><br />
                            Check your spam folder.
                        </p>
                        <Link href="/login" className="vhs-button w-full py-3 px-8 border border-white/10 text-sm uppercase tracking-[0.2em] text-white hover:text-[#00f0ff] hover:border-[#00f0ff]/50 mt-3 block text-center">
                            BACK TO SIGN IN
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full space-y-3 font-mono">
                        {error && (
                            <div className="text-red-400 text-xs text-center border border-red-500/30 bg-red-500/10 p-3 rounded-md tracking-wider mb-4">
                                {error}
                            </div>
                        )}

                        <input
                            type="email"
                            required
                            className="w-full bg-black/40 border border-white/10 text-white placeholder:text-white/30 px-6 py-4 text-sm focus:outline-none focus:border-white/40 focus:bg-white/5 tracking-widest transition-colors block text-center uppercase"
                            placeholder="EMAIL ADDRESS"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="vhs-button w-full py-4 px-8 bg-white/5 border border-white/20 text-sm uppercase tracking-[0.2em] text-white hover:border-white/40 disabled:opacity-50"
                            >
                                {loading ? 'TRANSMITTING...' : 'SEND RESET LINK'}
                            </button>
                        </div>

                        <Link href="/login" className="vhs-button w-full py-3 px-8 border border-white/10 text-sm uppercase tracking-[0.2em] text-white/60 hover:text-white hover:border-white/30 mt-3 block text-center">
                            BACK TO SIGN IN
                        </Link>
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
