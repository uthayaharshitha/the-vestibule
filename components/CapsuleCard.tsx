'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Capsule } from '@/types/database';
import { useState, useEffect, useRef } from 'react';

interface CapsuleCardProps {
    capsule: Capsule;
    revealDelay?: number; // ms stagger delay
}

function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

// Mix theme color with white to create a bright, on-color version for readability
function getBrightThemeColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Mix 65% white into the color to brighten it significantly
    const mix = (c: number) => Math.round(c + (255 - c) * 0.65);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function CapsuleCard({ capsule, revealDelay = 0 }: CapsuleCardProps) {
    const themeColor = capsule.theme_color || '#F5F5F5';
    const textColor = getContrastColor(themeColor);
    const isLightText = textColor === '#FFFFFF';
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // IntersectionObserver — reveal once on first entry, never re-trigger
    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const timer = setTimeout(() => setIsVisible(true), revealDelay);
                    observer.disconnect();
                    return () => clearTimeout(timer);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [revealDelay]);

    const handleClick = () => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('feedScrollY', window.scrollY.toString());
        }
    };

    return (
        <div
            ref={cardRef}
            className={`feed-card capsule-box cyber-outline transition-all duration-500${isVisible ? ' opacity-100 translate-y-0' : ' opacity-0 translate-y-4'}`}
            style={{
                color: themeColor,
                backgroundColor: `${themeColor}15`, // ~8% opacity wash
            }}
        >
            <Link href={`/capsule/${capsule.id}`} onClick={handleClick} className="block group">
                <div className="flex flex-col h-full">
                    {/* Top Bar - Title */}
                    <div
                        className="p-4 relative z-10 transition-colors"
                        style={{
                            backgroundColor: `${themeColor}38`,
                            borderBottom: `1px solid ${themeColor}40`
                        }}
                    >
                        <h3
                            className="text-xs font-bold uppercase tracking-widest leading-relaxed break-words font-mono"
                            style={{ color: getBrightThemeColor(themeColor), textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}
                        >
                            {capsule.title}
                        </h3>
                    </div>

                    {/* Cover Image */}
                    {capsule.cover_image_url ? (
                        <div className="relative overflow-hidden bg-black z-0 border-y border-transparent">
                            <img
                                src={capsule.cover_image_url}
                                alt={capsule.title}
                                className="object-contain w-full h-auto grayscale-[80%] hover:grayscale-[30%] transition-all duration-500"
                                loading="lazy"
                                onLoad={() => setImageLoaded(true)}
                                style={{
                                    filter: imageLoaded ? 'none' : 'blur(8px)',
                                    opacity: imageLoaded ? 0.85 : 0.2,
                                    display: 'block'
                                }}
                            />
                            {/* Inner vignette/border inside image */}
                            <div className="absolute inset-0 border-[4px] border-black/50 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    ) : (
                        <div className="relative aspect-[4/3] bg-black/90 flex flex-col items-center justify-center border-y border-white/5 opacity-40">
                            <span className="material-symbols-outlined text-2xl mb-2 opacity-50" style={{ color: themeColor }}>videocam_off</span>
                            <h3 className="text-[10px] font-black tracking-[0.3em] uppercase" style={{ color: themeColor }}>SIGNAL LOST</h3>
                            <p className="text-[7px] font-mono uppercase text-white/50 pt-1">Visual Log Corrupted</p>
                        </div>
                    )}

                    {/* Bottom Bar - Hashtags */}
                    <div
                        className="p-3 relative z-10 flex-grow flex flex-col justify-end"
                        style={{ backgroundColor: `${themeColor}30` }}
                    >
                        {capsule.capsule_hashtags && capsule.capsule_hashtags.length > 0 ? (
                            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                                {capsule.capsule_hashtags
                                    .sort((a: any, b: any) => a.order_index - b.order_index)
                                    .map((item: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                router.push(`/feed?tag=${encodeURIComponent(item.hashtag)}`);
                                            }}
                                            className="text-[8px] px-1.5 py-0.5 font-mono uppercase transition-colors hover:bg-white/10"
                                            style={{
                                                backgroundColor: `${themeColor}15`,
                                                border: `1px solid ${themeColor}50`,
                                                color: getBrightThemeColor(themeColor),
                                                letterSpacing: '0.05em',
                                                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                                            }}
                                        >
                                            {item.hashtag}
                                        </button>
                                    ))}
                            </div>
                        ) : (
                            <div className="h-4 flex items-center">
                                <span className="text-[7px] font-mono text-white/20 uppercase tracking-widest">[NO_TAGS_FOUND]</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
}
