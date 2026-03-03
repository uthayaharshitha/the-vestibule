'use client';

import { useEffect, useState } from 'react';

export default function AboutPage() {
    const [currentTime, setCurrentTime] = useState('');

    useEffect(() => {
        // Hydrate time only on client to avoid hydration mismatch
        const updateTime = () => {
            const now = new Date();
            const date = now.toLocaleDateString('en-GB') // DD/MM/YYYY
                .replace(/\//g, '-');
            const time = now.toLocaleTimeString('en-US', { hour12: false });
            setCurrentTime(`${date} [${time}]`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="relative z-40 min-h-screen pt-32 pb-24 px-6 md:px-0 flex flex-col items-center overflow-x-hidden font-mono grayscale-[10%]">

            {/* ── VHS Surveillance Overlays ── */}
            <div className="about-vhs-grain"></div>
            <div className="about-scanlines"></div>

            {/* Top Left: REC */}
            <div className="fixed top-24 left-8 z-[60] flex items-center gap-2 text-red-600 font-mono text-[10px] md:text-sm tracking-widest uppercase">
                <span className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full about-blink"></span>
                <span className="about-chromatic-text">REC ●</span>
            </div>

            {/* Top Right: Timestamp */}
            <div className="fixed top-24 right-8 z-[60] text-[#00f0ff] font-mono text-[10px] md:text-sm tracking-widest about-flicker pointer-events-none opacity-80">
                <span>{currentTime || 'SYNCHRONIZING...'}</span>
            </div>


            {/* Right Vertical Monitor */}
            <div className="fixed right-4 bottom-24 hidden xl:flex flex-col gap-4 text-[#00f0ff]/20 font-mono text-[10px] uppercase pointer-events-none z-[60]">
                <div className="h-32 w-px bg-gradient-to-t from-[#00f0ff]/40 to-transparent mx-auto"></div>
                <p style={{ writingMode: 'vertical-rl' }} className="tracking-[0.2em]">Cognitive Drift: 0.04%</p>
            </div>

            {/* ── Main Content Block ── */}
            <div className="w-full max-w-4xl about-cyber-frame p-8 md:p-16 bg-black/60 backdrop-blur-md relative z-[70] mt-8">
                <header className="mb-16">
                    <h1 className="italic text-4xl md:text-5xl text-gray-300 about-chromatic-text mb-4 tracking-tight">
                        About The Vestibule
                    </h1>
                    <div className="h-0.5 w-24 bg-[#00f0ff]/40"></div>
                </header>

                <div className="space-y-14">
                    {/* Intro Section */}
                    <section>
                        <p className="text-gray-300 leading-relaxed text-lg font-light opacity-90 font-['Space_Grotesk'] md:text-xl">
                            The digital landscape is built for speed. Modern platforms are engineered for rapid consumption, driven by performance metrics and an endless cycle of engagement. The Vestibule is a deliberate departure from this model — a space designed for cognitive deceleration and genuine human connection.
                        </p>
                    </section>

                    {/* Architecture Section */}
                    <section>
                        <h2 className="text-[#ff003c] font-['Space_Grotesk'] text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-[#ff003c]"></span>
                            The Architecture of Disruption
                        </h2>
                        <div className="space-y-6 text-gray-400 leading-relaxed font-mono text-[13px] md:text-sm">
                            <p>
                                We use atmospheric, isolated environments to pull the user out of Passive Habituation. By introducing Cognitive Friction — intentional breaks in the standard digital experience — we interrupt automated browsing patterns. This shifts the user into a state of Active Awareness, allowing for genuine emotional and mental reflection.
                            </p>
                            <p>
                                By removing dopamine-driven feedback loops, we facilitate a visceral state of presence. This isn&apos;t just a hub for the unsettling; it is a tool for Sensory Recalibration, allowing you to inhabit a digital space rather than just passing through it.
                            </p>
                        </div>
                    </section>

                    {/* Philosophy Section */}
                    <section>
                        <h2 className="text-[#ff003c] font-['Space_Grotesk'] text-xs tracking-[0.3em] uppercase mb-6 flex items-center gap-3">
                            <span className="w-8 h-px bg-[#ff003c]"></span>
                            Philosophy — Expression Over Performance
                        </h2>
                        <div className="space-y-6 text-gray-400 leading-relaxed font-mono text-[13px] md:text-sm">
                            <p>
                                This platform marks a return to the foundational philosophy of the early web: self-expression for its own sake. We prioritize the act of creation over the demands of an algorithm.
                            </p>
                        </div>
                    </section>
                </div>

            </div>

            {/* Dark Vignette Overlay */}
            <div className="fixed inset-0 pointer-events-none z-[80] shadow-[inset_0_0_150px_rgba(0,0,0,0.85)]"></div>
        </main>
    );
}
