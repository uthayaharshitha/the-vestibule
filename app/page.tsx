'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, ensureAnonymousUser } from '@/lib/auth';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [guestLoading, setGuestLoading] = useState(false);

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) {
        router.replace('/feed');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  if (checking) {
    // Invisible while resolving auth — avoids flash
    return null;
  }

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

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-2xl vhs-screen-jitter">
        <h1 className="text-6xl md:text-8xl font-semibold mb-6 vhs-chromatic-aberration opacity-90 blur-[0.3px] font-sans">
          The Vestibule
        </h1>

        <div className="w-full max-w-md space-y-4 font-mono">
          {/* Enter as Guest */}
          <button
            onClick={async () => {
              setGuestLoading(true);
              // Attempt to create an anonymous session — if it fails (e.g. CAPTCHA
              // or anonymous sign-ins disabled), still let the user browse the feed.
              try {
                await ensureAnonymousUser();
              } catch (_) {
                // swallow — feed is publicly readable
              }
              router.push('/feed');
            }}
            disabled={guestLoading}
            className="vhs-button w-full block py-4 px-8 bg-white/5 border border-white/20 text-xl uppercase tracking-widest text-white hover:border-white/40 text-center disabled:opacity-50"
          >
            {guestLoading ? 'Loading...' : 'Enter as Guest'}
          </button>

          {/* Log In */}
          <Link
            href="/login"
            className="vhs-button w-full block py-3 px-8 border border-white/10 text-lg uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 text-center"
          >
            Log In
          </Link>

          {/* Sign Up */}
          <Link
            href="/signup"
            className="vhs-button w-full block py-3 px-8 border border-white/10 text-lg uppercase tracking-widest text-white/60 hover:text-white hover:border-white/30 text-center"
          >
            Sign Up
          </Link>
        </div>

        {/* Footer links */}
        <footer className="mt-16 flex space-x-6 text-xs uppercase tracking-[0.2em] text-white/30 font-mono">
          <Link href="/about" className="hover:text-white/60 transition-colors">About</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
          <Link href="/copyright-policy" className="hover:text-white/60 transition-colors">Copyright</Link>
        </footer>
      </div>

      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[60] mix-blend-overlay opacity-20 bg-[url('https://www.transparenttextures.com/patterns/p6-dark.png')]"></div>
    </main>
  );
}
