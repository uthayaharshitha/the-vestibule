'use client';

import { useEffect, useRef } from 'react';

/**
 * GrainOverlay — persistent VHS film-grain effect over the entire viewport.
 *
 * - Canvas draws random monochrome noise at 256×256 and tiles it across
 *   the screen via CSS (imageRendering: pixelated for chunky VHS grain).
 * - Throttled to ~12 fps for an authentic analog feel.
 * - mixBlendMode: 'screen' makes it visible on dark backgrounds without
 *   washing out light ones.
 * - pointer-events: none means it never blocks any interaction.
 * - Scanline div adds classic horizontal CRT/VHS banding underneath.
 */
export default function GrainOverlay() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const SIZE = 256;
        canvas.width = SIZE;
        canvas.height = SIZE;

        let animId: number;
        let lastTime = 0;
        const TARGET_FPS = 12; // VHS-authentic low framerate
        const INTERVAL = 1000 / TARGET_FPS;

        const drawGrain = (timestamp: number) => {
            animId = requestAnimationFrame(drawGrain);
            if (timestamp - lastTime < INTERVAL) return;
            lastTime = timestamp;

            const imageData = ctx.createImageData(SIZE, SIZE);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const v = (Math.random() * 255) | 0;
                data[i] = v;
                data[i + 1] = v;
                data[i + 2] = v;
                data[i + 3] = 80; // ~31% alpha per grain pixel
            }

            ctx.putImageData(imageData, 0, 0);
        };

        animId = requestAnimationFrame(drawGrain);
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <>
            {/* Animated grain */}
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    opacity: 0.22,
                    mixBlendMode: 'screen',
                    imageRendering: 'pixelated', // keeps grain chunky, not blurred
                }}
            />

            {/* Scanlines */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 9997,
                    backgroundImage:
                        'repeating-linear-gradient(to bottom, transparent 0px, transparent 3px, rgba(0,0,0,0.22) 3px, rgba(0,0,0,0.22) 4px)',
                }}
            />
        </>
    );
}
