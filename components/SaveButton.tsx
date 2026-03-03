'use client';

import { useEffect, useState } from 'react';
import { saveCapsule, unsaveCapsule, isCapsuleSaved } from '@/lib/user-mutations';
import { getCurrentUser } from '@/lib/auth';

interface SaveButtonProps {
    capsuleId: string;
}

export default function SaveButton({ capsuleId }: SaveButtonProps) {
    const [saved, setSaved] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const init = async () => {
            const user = await getCurrentUser();
            if (cancelled) return;
            if (!user) { setIsLoggedIn(false); return; }
            setIsLoggedIn(true);
            const result = await isCapsuleSaved(capsuleId);
            if (!cancelled) setSaved(result);
        };
        init();
        return () => { cancelled = true; };
    }, [capsuleId]);

    if (!isLoggedIn) return null;

    const handleToggle = async () => {
        if (loading) return;
        setLoading(true);
        if (saved) {
            await unsaveCapsule(capsuleId);
            setSaved(false);
        } else {
            await saveCapsule(capsuleId);
            setSaved(true);
        }
        setLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={saved ? 'Remove from saved' : 'Save this capsule'}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                padding: 0,
                fontSize: '0.75rem',
                color: saved ? 'var(--text-main)' : 'var(--text-tertiary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'color 0.15s, opacity 0.15s',
                fontWeight: saved ? 500 : 400,
                letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => !saved && (e.currentTarget.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => !saved && (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
            {/* Bookmark icon */}
            <svg
                width="12"
                height="14"
                viewBox="0 0 12 14"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M1 1h10v12l-5-3-5 3V1z" />
            </svg>
            {saved ? 'Saved' : 'Save'}
        </button>
    );
}
