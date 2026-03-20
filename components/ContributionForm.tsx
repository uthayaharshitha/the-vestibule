'use client';

import { useState, useEffect } from 'react';
import { createContribution } from '@/lib/contribution-mutations';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface ContributionFormProps {
    capsuleId: string;
    onSuccess: () => void;
}

export default function ContributionForm({ capsuleId, onSuccess }: ContributionFormProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
    const [contentText, setContentText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [boxColor, setBoxColor] = useState('#F5F5F5');
    const [boxColorHex, setBoxColorHex] = useState('#F5F5F5');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCurrentUser().then((user) => {
            setIsAuthenticated(!!user);
        });
    }, []);

    const isDirty = !isSubmitting && (contentText.trim() !== '' || isAnonymous !== false || boxColor !== '#F5F5F5');
    useUnsavedChanges(isDirty);

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setBoxColor(color);
        setBoxColorHex(color);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setBoxColorHex(hex);
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            setBoxColor(hex);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contentText.trim()) {
            setError('Please write something before submitting');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { contribution, error: submitError } = await createContribution(
            capsuleId,
            contentText,
            'writing',
            undefined,
            isAnonymous,
            boxColor
        );

        setIsSubmitting(false);

        if (submitError) {
            setError('Failed to submit contribution. Please try again.');
            return;
        }

        setContentText('');
        setBoxColor('#F5F5F5');
        setBoxColorHex('#F5F5F5');

        // Notify parent
        onSuccess();
    };

    // Still resolving auth
    if (isAuthenticated === null) {
        return null;
    }

    // Guest — show gentle prompt
    if (!isAuthenticated) {
        return (
            <div
                style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    textAlign: 'center',
                }}
            >
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                    Sign in to leave a contribution.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Link
                        href="/login"
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '6px',
                            background: 'var(--text-main)',
                            color: 'var(--bg-main)',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}
                    >
                        Log In
                    </Link>
                    <Link
                        href="/signup"
                        style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-main)',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                        }}
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">

            <div>
                <label htmlFor="content-text" className="block text-sm font-medium text-gray-700 mb-2">
                    Your contribution
                </label>
                <textarea
                    id="content-text"
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    rows={6}
                    placeholder="SHARE YOUR THOUGHTS, REFLECTIONS, OR CREATIVE WRITING..."
                    className="archive-input resize-none"
                    disabled={isSubmitting}
                />
            </div>


            <div className="flex items-center">
                <input
                    id="is-anonymous"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    disabled={isSubmitting}
                />
                <label htmlFor="is-anonymous" className="ml-2 block text-sm text-gray-700">
                    Post anonymously
                </label>
            </div>

            <div>
                <label htmlFor="box-color" className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                    Box Color
                </label>
                <div className="flex gap-4 items-center">
                    <div>
                        <input
                            id="box-color"
                            type="color"
                            value={boxColor}
                            onChange={handleColorPickerChange}
                            className="w-20 h-10 border rounded cursor-pointer"
                            style={{ borderColor: 'var(--border-color)' }}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={boxColorHex}
                            onChange={handleHexInputChange}
                            placeholder="#F5F5F5"
                            className="archive-input"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="archive-btn"
            >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT CONTRIBUTION'}
            </button>

            <p className="text-xs text-gray-500 text-center">
                Your contribution will be posted anonymously. No account required.
            </p>
        </form>
    );
}
