'use client';

import { useEffect, useRef, useState } from 'react';
import MediaGallery from './MediaGallery';
import SensoryNotes from './SensoryNotes';
import ContributionsList from './ContributionsList';
import ReportButton from './ReportButton';
import SaveButton from './SaveButton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useReadMode } from '@/contexts/ReadModeContext';
import { getRandomCapsule } from '@/lib/capsule-queries';

interface CapsuleContentProps {
    capsule: any;
    id: string;
    themeColor: string;
    textColor: string;
    isLightText: boolean;
}

export default function CapsuleContent({ capsule, id, themeColor, textColor, isLightText }: CapsuleContentProps) {
    const { isReadMode, setIsReadMode } = useReadMode();
    const router = useRouter();
    const [isDrifting, setIsDrifting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Enter/Exit Fullscreen when isReadMode toggles
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        if (isReadMode) {
            if (!document.fullscreenElement) {
                if (el.requestFullscreen) {
                    el.requestFullscreen().catch((err) => {
                        console.warn("Fullscreen API failed, relying on CSS fallback:", err);
                    });
                }
            }
        } else {
            if (document.fullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        }
    }, [isReadMode]);

    // Sync native fullscreen exits (ESC key, swipe back) with React state
    useEffect(() => {
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isReadMode) {
                setIsReadMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isReadMode, setIsReadMode]);

    // ── Ambient audio state ──────────────────────────────────────────────────
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioUrl: string | null =
        capsule.capsule_audio &&
            Array.isArray(capsule.capsule_audio) &&
            capsule.capsule_audio.length > 0
            ? capsule.capsule_audio[0].file_url
            : null;

    useEffect(() => {
        console.log('[CapsuleContent] capsule.capsule_audio:', capsule.capsule_audio);
        console.log('[CapsuleContent] resolved audioUrl:', audioUrl);
    }, []);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        const onTime = () => setCurrentTime(el.currentTime);
        const onMeta = () => setDuration(el.duration);
        el.addEventListener('timeupdate', onTime);
        el.addEventListener('loadedmetadata', onMeta);
        return () => {
            el.removeEventListener('timeupdate', onTime);
            el.removeEventListener('loadedmetadata', onMeta);
        };
    }, [audioUrl]);

    // Auto-play when the capsule opens (if audio is present)
    useEffect(() => {
        if (!audioUrl) return;
        const el = audioRef.current;
        if (!el) return;
        el.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
                // Browser blocked autoplay (no prior user gesture); leave paused
            });
    }, [audioUrl]);

    const toggleAudio = () => {
        const el = audioRef.current;
        if (!el) return;
        if (isPlaying) {
            el.pause();
            setIsPlaying(false);
        } else {
            el.play().then(() => setIsPlaying(true)).catch(console.error);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = audioRef.current;
        if (!el || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        el.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
    };

    const audioProgress = duration ? (currentTime / duration) * 100 : 0;
    // ────────────────────────────────────────────────────────────────────────

    // Stamp body with data-read-mode so CSS can remove pt-16 gaps
    useEffect(() => {
        document.body.setAttribute('data-read-mode', String(isReadMode));
        return () => { document.body.removeAttribute('data-read-mode'); };
    }, [isReadMode]);

    const handleDrift = async () => {
        setIsDrifting(true);
        const { capsule: c } = await getRandomCapsule();
        if (c) router.push(`/capsule/${c.id}`);
        setIsDrifting(false);
    };



    // Derive sensory notes
    const sensoryNotes = capsule.capsule_notes || [];

    // ── Accent color derived from theme ─────────────────────────────────────
    // If the themeColor is dark, we can use a vibrant version or the textColor as an accent.
    // However, since the capsule theme defines the mood, we will use the textColor
    // (which contrasts with the background) as the primary border/text accent to ensure readability.
    const accentColor = isLightText ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)';
    const accentGlow = isLightText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    const accentBorder = isLightText ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.2)';

    // Text opacity helpers
    const dimText = isLightText ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';
    const mutedText = isLightText ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)';
    const bodyText = isLightText ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)';

    return (
        <div 
            ref={containerRef}
            className={`capsule-page-transition ${isReadMode ? 'read-mode-fullscreen' : ''}`}
            style={isReadMode ? { backgroundColor: 'var(--bg-main)', overflowY: 'auto', minHeight: '100vh', padding: 'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)' } : {}}
        >

            {/* ── READ MODE controls (fixed, top-right) ── */}
            {isReadMode && (
                <div
                    style={{
                        position: 'fixed',
                        top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
                        right: 'calc(env(safe-area-inset-right, 0px) + 20px)',
                        zIndex: 1000,
                        display: 'flex',
                        gap: '20px',
                        alignItems: 'center',
                    }}
                >
                    <button
                        className="font-mono"
                        onClick={() => setIsReadMode(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            opacity: 0.6,
                            cursor: 'pointer',
                            color: textColor,
                            padding: 0,
                            letterSpacing: '0.04em',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                    >
                        exit
                    </button>
                    <button
                        className="font-mono"
                        onClick={handleDrift}
                        disabled={isDrifting}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '13px',
                            opacity: isDrifting ? 0.3 : 0.6,
                            cursor: 'pointer',
                            color: textColor,
                            padding: 0,
                            letterSpacing: '0.04em',
                            transition: 'opacity 0.2s ease',
                        }}
                        onMouseEnter={e => !isDrifting && ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                        onMouseLeave={e => !isDrifting && ((e.currentTarget as HTMLButtonElement).style.opacity = '0.6')}
                    >
                        {isDrifting ? '...' : 'drift'}
                    </button>
                </div>
            )}

            {/* ── READ MODE save button (fixed, top-left) ── */}
            {isReadMode && (
                <div
                    style={{
                        position: 'fixed',
                        top: 'calc(env(safe-area-inset-top, 0px) + 20px)',
                        left: 'calc(env(safe-area-inset-left, 0px) + 20px)',
                        zIndex: 100000,
                        color: textColor,
                    }}
                >
                    <SaveButton capsuleId={id} textColor={textColor} />
                </div>
            )}


            <div
                className={`capsule-outer-wrap${isReadMode ? ' read-mode-root' : ''}`}
                style={{ maxWidth: '1152px', margin: '0 auto', padding: '3rem 1.5rem 4rem' }}
            >

                {/* ── MAIN CAPSULE CONTAINER ── */}
                <div
                    className={`capsule-double-border capsule-bg-overlay ${isReadMode ? 'border-none shadow-none md:p-12 p-6' : ''}`}
                    style={{
                        borderColor: isReadMode ? 'transparent' : accentColor,
                        outlineColor: isReadMode ? 'transparent' : accentColor,
                        boxShadow: isReadMode ? 'none' : `0 0 40px ${accentGlow}`,
                    }}
                >

                    {/* ── Title ── */}
                    <h1
                        style={{
                            color: accentColor,
                            fontSize: 'clamp(1.6rem, 4vw, 2.8rem)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            letterSpacing: '-0.02em',
                            textAlign: 'center',
                            marginBottom: '1.25rem',
                        }}
                    >
                        {capsule.title}
                    </h1>

                    {/* ── Creator + action row ── */}
                    {!isReadMode && (
                        <div
                            className="font-mono"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1.5rem',
                                flexWrap: 'wrap',
                                marginBottom: '2.5rem',
                                fontSize: '0.6rem',
                                letterSpacing: '0.18em',
                                textTransform: 'uppercase',
                                color: dimText,
                            }}
                        >
                            {/* Back to feed */}
                            <Link
                                href="/feed"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.4rem',
                                    color: dimText,
                                    textDecoration: 'none',
                                    transition: 'opacity 0.15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                                <span>[Back]</span>
                            </Link>

                            {/* Creator */}
                            {capsule.users?.username && (
                                <Link
                                    href={`/profile/${capsule.users.username}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                        color: dimText,
                                        textDecoration: 'none',
                                        transition: 'opacity 0.15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
                                >
                                    {capsule.users.profile_image_url ? (
                                        <img
                                            src={capsule.users.profile_image_url}
                                            alt=""
                                            style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                                        </svg>
                                    )}
                                    <span>@{capsule.users.username}</span>
                                </Link>
                            )}

                            {/* Read Mode */}
                            <button
                                onClick={() => setIsReadMode(true)}
                                className="capsule-action-btn"
                                style={{ color: dimText }}
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                                <span>[Read Mode]</span>
                            </button>

                            {/* Save */}
                            <span className="capsule-action-btn" style={{ color: dimText }}>
                                <SaveButton capsuleId={id} />
                            </span>

                            {/* Report */}
                            <span className="capsule-action-btn" style={{ color: dimText }}>
                                <ReportButton targetType="capsule" targetId={id} />
                            </span>


                        </div>
                    )}

                    {/* ── MEDIA CAROUSEL ── */}
                    {capsule.capsule_media && capsule.capsule_media.length > 0 && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <MediaGallery media={capsule.capsule_media} hideTitle={true} isNewDesign={true} accentColor={accentColor} accentGlow={accentGlow} />
                        </div>
                    )}

                    {/* ── 2-COLUMN BODY GRID ── */}
                    <div className="capsule-body-grid">

                        {/* Left column: Body text + Contributions */}
                        <div className="capsule-body-left">

                            {/* Body / Description */}
                            {capsule.description && (
                                <div
                                    className="capsule-body-prose font-mono"
                                    style={{
                                        fontSize: '0.8rem',
                                        lineHeight: 1.8,
                                        color: bodyText,
                                        whiteSpace: 'pre-wrap',
                                        marginBottom: '3rem',
                                    }}
                                >
                                    {capsule.description}
                                </div>
                            )}

                            {/* Contributions */}
                            <div
                                style={{
                                    borderTop: `1px solid ${isLightText ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
                                    paddingTop: '2rem',
                                }}
                            >
                                <ContributionsList capsuleId={id} hideTitle={isReadMode} />
                            </div>
                        </div>

                        {/* Right column: Sonic Profile + Sensory Notes + Meta */}
                        <div className="capsule-body-right">

                            {/* ── Sonic Profile (audio panel) ── */}
                            {audioUrl && (
                                <div className="capsule-sidebar-panel" style={{ borderColor: accentBorder }}>
                                    <h4 className="capsule-sidebar-label" style={{ color: dimText }}>Sonic Profile</h4>

                                    {/* Hidden HTML audio element */}
                                    <audio
                                        ref={audioRef}
                                        src={audioUrl}
                                        loop
                                        onEnded={() => setIsPlaying(false)}
                                    />

                                    {/* Animated waveform bars (matching reference design exactly) */}
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '4px',
                                            height: '64px', // h-16
                                            marginBottom: '1.5rem', // mb-6
                                        }}
                                    >
                                        {[16, 32, 48, 40, 56, 32, 48, 24, 40, 32, 48, 16].map((h, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '4px', // w-1 equivalent
                                                    height: `${h}px`,
                                                    borderRadius: '4px', // rounded-md
                                                    background: accentColor,
                                                    opacity: isPlaying ? 1 : 0.5,
                                                    animation: isPlaying ? `capsuleBarPulse ${0.8 + (i % 4) * 0.2}s ease-in-out infinite alternate` : 'none',
                                                    transition: 'opacity 0.3s ease',
                                                }}
                                            />
                                        ))}
                                    </div>

                                    {/* Play/Pause button */}
                                    <button
                                        className="font-mono"
                                        onClick={toggleAudio}
                                        style={{
                                            width: '100%',
                                            border: `1px solid ${accentColor}`,
                                            background: 'transparent',
                                            color: accentColor,
                                            fontSize: '0.75rem', // text-xs
                                            letterSpacing: '0.1em',
                                            padding: '0.75rem 0', // py-3
                                            borderRadius: '0.375rem', // rounded-md
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            display: 'block',
                                            textAlign: 'center',
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = accentColor;
                                            (e.currentTarget as HTMLButtonElement).style.color = isLightText ? '#000' : '#fff';
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                            (e.currentTarget as HTMLButtonElement).style.color = accentColor;
                                        }}
                                    >
                                        {isPlaying ? '[ PAUSE AUDIO ]' : '[ PLAY AUDIO ]'}
                                    </button>
                                </div>
                            )}

                            {/* ── Sensory Notes panel ── */}
                            {sensoryNotes.length > 0 && (
                                <div className="capsule-sidebar-panel" style={{ borderColor: accentBorder }}>
                                    <h4 className="capsule-sidebar-label" style={{ color: dimText }}>Sensory Notes</h4>
                                    <SensoryNotes notes={sensoryNotes} hideTitle={true} isNewDesign={true} accentColor={accentColor} accentGlow={accentGlow} accentBorder={accentBorder} />
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
