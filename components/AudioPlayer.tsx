'use client';

import { CapsuleAudio } from '@/types/database';
import { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    audio: CapsuleAudio | null;
    hideTitle?: boolean;
    textColor?: string;
}

export default function AudioPlayer({ audio, textColor = 'var(--text-main)' }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;

        const updateTime = () => setCurrentTime(el.currentTime);
        const updateDuration = () => setDuration(el.duration);

        el.addEventListener('timeupdate', updateTime);
        el.addEventListener('loadedmetadata', updateDuration);

        return () => {
            el.removeEventListener('timeupdate', updateTime);
            el.removeEventListener('loadedmetadata', updateDuration);
        };
    }, []);

    if (!audio) return null;

    const togglePlay = () => {
        const el = audioRef.current;
        if (!el) return;
        if (isPlaying) {
            el.pause();
        } else {
            el.play();
        }
        setIsPlaying(!isPlaying);
    };

    const progress = duration ? (currentTime / duration) * 100 : 0;

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const el = audioRef.current;
        if (!el || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        el.currentTime = ratio * duration;
    };

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '0.75rem',
                marginBottom: '1.5rem',
            }}
        >
            <audio
                ref={audioRef}
                src={audio.file_url}
                loop
                onEnded={() => setIsPlaying(false)}
            />

            {/* Play / Pause */}
            <button
                onClick={togglePlay}
                title={isPlaying ? 'Pause ambient audio' : 'Play ambient audio'}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: textColor,
                    opacity: 0.55,
                    transition: 'opacity 0.2s ease',
                    lineHeight: 1,
                    flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
            >
                {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 4h2v12H6zm6 0h2v12h-2z" />
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 4l10 6-10 6V4z" />
                    </svg>
                )}
            </button>

            {/* Thin progress bar — clickable to seek */}
            <div
                onClick={handleSeek}
                style={{
                    width: '120px',
                    height: '2px',
                    background: `${textColor}28`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: textColor,
                        opacity: 0.55,
                        borderRadius: '2px',
                        transition: 'width 0.5s linear',
                    }}
                />
            </div>
        </div>
    );
}
