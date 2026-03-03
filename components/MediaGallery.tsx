'use client';

import { CapsuleMedia } from '@/types/database';
import { useState, useRef, useEffect, useCallback } from 'react';

interface MediaGalleryProps {
    media: CapsuleMedia[];
    hideTitle?: boolean;
    /** When true, renders Figma-style carousel arrows */
    isNewDesign?: boolean;
    accentColor?: string;
    accentGlow?: string;
}

export default function MediaGallery({ media, hideTitle, isNewDesign, accentColor, accentGlow }: MediaGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    // Sort by order_index
    const sortedMedia = [...media].sort((a, b) => a.order_index - b.order_index);

    // Sync activeIndex with native scroll position
    const handleScroll = useCallback(() => {
        const el = carouselRef.current;
        if (!el) return;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        setActiveIndex(index);
    }, []);

    // Scroll to a specific index programmatically
    const scrollTo = (index: number) => {
        const el = carouselRef.current;
        if (!el) return;
        el.scrollTo({ left: index * el.clientWidth, behavior: 'smooth' });
    };

    // Keyboard navigation for lightbox
    useEffect(() => {
        if (lightboxIndex === null) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightboxIndex(null);
            else if (e.key === 'ArrowLeft' && lightboxIndex > 0) setLightboxIndex(lightboxIndex - 1);
            else if (e.key === 'ArrowRight' && lightboxIndex < sortedMedia.length - 1) setLightboxIndex(lightboxIndex + 1);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex, sortedMedia.length]);

    if (media.length === 0) return null;

    return (
        <div>
            {!hideTitle && (
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Visual Atmosphere</h3>
            )}

            {/* ── CAROUSEL ── */}
            <div style={{ position: 'relative' }}>
                <div
                    ref={carouselRef}
                    onScroll={handleScroll}
                    style={{
                        display: 'flex',
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        scrollBehavior: 'smooth',
                        borderRadius: '12px',
                        /* Hide scrollbar cross-browser */
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                    className="carousel-hide-scrollbar"
                >
                    {sortedMedia.map((item, index) => (
                        <div
                            key={item.id}
                            style={{
                                flex: '0 0 100%',
                                scrollSnapAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                cursor: 'zoom-in',
                                minHeight: '200px',
                            }}
                            onClick={() => setLightboxIndex(index)}
                        >
                            {item.media_type === 'video' ? (
                                <video
                                    src={item.file_url}
                                    muted
                                    playsInline
                                    controls
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        display: 'block',
                                    }}
                                />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.file_url}
                                    alt={`Capsule media ${index + 1}`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '70vh',
                                        objectFit: 'contain',
                                        borderRadius: '12px',
                                        display: 'block',
                                        userSelect: 'none',
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Prev arrow */}
                {activeIndex > 0 && (
                    <button
                        onClick={() => scrollTo(activeIndex - 1)}
                        className={isNewDesign ? 'carousel-arrow-new' : undefined}
                        style={isNewDesign ? {
                            position: 'absolute',
                            left: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: `1px solid ${accentColor}`,
                            color: accentColor,
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: 1,
                            zIndex: 10,
                            backdropFilter: 'blur(4px)',
                            transition: 'box-shadow 0.2s ease',
                        } : {
                            position: 'absolute',
                            left: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.35)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                            lineHeight: 1,
                            zIndex: 10,
                            backdropFilter: 'blur(4px)',
                        }}
                        onMouseEnter={isNewDesign ? e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 15px ${accentGlow}`; } : undefined}
                        onMouseLeave={isNewDesign ? e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; } : undefined}
                    >
                        ‹
                    </button>
                )}

                {/* Next arrow */}
                {activeIndex < sortedMedia.length - 1 && (
                    <button
                        onClick={() => scrollTo(activeIndex + 1)}
                        className={isNewDesign ? 'carousel-arrow-new' : undefined}
                        style={isNewDesign ? {
                            position: 'absolute',
                            right: '16px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.5)',
                            border: `1px solid ${accentColor}`,
                            color: accentColor,
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '20px',
                            lineHeight: 1,
                            zIndex: 10,
                            backdropFilter: 'blur(4px)',
                            transition: 'box-shadow 0.2s ease',
                        } : {
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(0,0,0,0.35)',
                            border: 'none',
                            color: '#fff',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '18px',
                            lineHeight: 1,
                            zIndex: 10,
                            backdropFilter: 'blur(4px)',
                        }}
                        onMouseEnter={isNewDesign ? e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 15px ${accentGlow}`; } : undefined}
                        onMouseLeave={isNewDesign ? e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none'; } : undefined}
                    >
                        ›
                    </button>
                )}
            </div>

            {/* Dot indicators */}
            {sortedMedia.length > 1 && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '6px',
                        marginTop: '0.75rem',
                    }}
                >
                    {sortedMedia.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => scrollTo(i)}
                            style={{
                                width: i === activeIndex ? '20px' : '6px',
                                height: '6px',
                                borderRadius: '3px',
                                border: 'none',
                                background: isNewDesign
                                    ? (i === activeIndex ? accentColor : `${accentColor}40`)
                                    : (i === activeIndex ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)'),
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'width 0.25s ease, background 0.25s ease',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ── LIGHTBOX ── */}
            {lightboxIndex !== null && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.95)',
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                    onClick={() => setLightboxIndex(null)}
                >
                    {/* Close */}
                    <button
                        style={{
                            position: 'absolute',
                            top: '72px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.3)',
                            color: '#fff',
                            fontSize: '28px',
                            cursor: 'pointer',
                            lineHeight: 1,
                            zIndex: 10,
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onClick={e => { e.stopPropagation(); setLightboxIndex(null); }}
                    >
                        ×
                    </button>

                    <div
                        style={{ maxWidth: '90vw', maxHeight: '90vh' }}
                        onClick={e => e.stopPropagation()}
                    >
                        {sortedMedia[lightboxIndex].media_type === 'video' ? (
                            <video
                                src={sortedMedia[lightboxIndex].file_url}
                                controls
                                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
                            />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={sortedMedia[lightboxIndex].file_url}
                                alt={`Media ${lightboxIndex + 1}`}
                                style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
                            />
                        )}
                    </div>

                    {/* Lightbox prev */}
                    {lightboxIndex > 0 && (
                        <button
                            style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '56px',
                                height: '56px',
                                fontSize: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                        >
                            ‹
                        </button>
                    )}

                    {/* Lightbox next */}
                    {lightboxIndex < sortedMedia.length - 1 && (
                        <button
                            style={{
                                position: 'absolute',
                                right: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'rgba(255,255,255,0.15)',
                                border: 'none',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '56px',
                                height: '56px',
                                fontSize: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                        >
                            ›
                        </button>
                    )}

                    {/* Counter */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '16px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            color: '#fff',
                            fontSize: '13px',
                            background: 'rgba(0,0,0,0.5)',
                            padding: '4px 14px',
                            borderRadius: '20px',
                        }}
                    >
                        {lightboxIndex + 1} / {sortedMedia.length}
                    </div>
                </div>
            )}

            {/* Hide webkit scrollbar inline via global style injection */}
            <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
}
