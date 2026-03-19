'use client';

import { useCapsuleUpload } from '@/contexts/CapsuleUploadContext';

export default function PostingBanner() {
    const { isPosting, postingProgress, postingLabel } = useCapsuleUpload();

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)',
                left: '16px',
                zIndex: 9999,
                opacity: isPosting ? 1 : 0,
                pointerEvents: 'none',
                transition: 'opacity 0.35s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                minWidth: 160,
                maxWidth: 'calc(100vw - 120px)',
            }}
            aria-hidden={!isPosting}
        >
            <div
                style={{
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 4,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                {/* Subtle pulse dot */}
                <div
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'var(--text-secondary)',
                        opacity: 0.7,
                        flexShrink: 0,
                        animation: isPosting ? 'bannerPulse 1.4s ease-in-out infinite' : 'none',
                    }}
                />
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.05em',
                        fontFamily: 'var(--font-geist-mono, monospace)',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {postingLabel}
                </span>
            </div>

            {/* Thin progress bar */}
            <div
                style={{
                    height: 2,
                    borderRadius: 1,
                    background: 'var(--border-color)',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${postingProgress}%`,
                        background: 'var(--text-secondary)',
                        opacity: 0.6,
                        transition: 'width 0.4s ease',
                    }}
                />
            </div>

            <style>{`
                @keyframes bannerPulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    );
}
