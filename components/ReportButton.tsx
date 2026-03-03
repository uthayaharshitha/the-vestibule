'use client';

import { useState } from 'react';
import { createReport } from '@/lib/moderation-mutations';
import { useToast } from '@/contexts/ToastContext';

const REPORT_REASONS = [
    'Copyright issue',
    'Inappropriate content',
    'Harassment',
    'Other',
];

interface ReportButtonProps {
    targetType: 'capsule' | 'contribution';
    targetId: string;
}

export default function ReportButton({ targetType, targetId }: ReportButtonProps) {
    const { showToast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openModal = () => {
        setReason('');
        setDetails('');
        setError(null);
        setIsOpen(true);
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsOpen(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason) {
            setError('Please select a reason.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { error: submitError } = await createReport(
            targetType,
            targetId,
            reason,
            details.trim() || undefined
        );

        setIsSubmitting(false);

        if (submitError) {
            setError('Failed to submit. Please try again.');
            return;
        }

        setIsOpen(false);
        showToast('Report submitted for review.');
    };

    return (
        <>
            {/* Trigger */}
            <button
                onClick={openModal}
                style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '0.75rem',
                    color: 'var(--text-tertiary)',
                    cursor: 'pointer',
                    opacity: 0.7,
                    transition: 'opacity 0.15s',
                    letterSpacing: '0.01em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                title="Report this content"
            >
                Report
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 2000,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1rem',
                    }}
                >
                    <div
                        style={{
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '2rem',
                            width: '100%',
                            maxWidth: '440px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
                        }}
                    >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: 'var(--text-main)',
                                    letterSpacing: '0.02em',
                                    margin: 0,
                                }}
                            >
                                Report Content
                            </h2>
                            <button
                                onClick={closeModal}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-tertiary)',
                                    fontSize: '1.25rem',
                                    lineHeight: 1,
                                    padding: '0 0.25rem',
                                }}
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Reason dropdown */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label
                                    htmlFor="report-reason"
                                    style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.4rem',
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    Reason
                                </label>
                                <select
                                    id="report-reason"
                                    value={reason}
                                    onChange={(e) => { setReason(e.target.value); setError(null); }}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <option value="">Select a reason…</option>
                                    {REPORT_REASONS.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Additional details */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label
                                    htmlFor="report-details"
                                    style={{
                                        display: 'block',
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: '0.4rem',
                                        letterSpacing: '0.02em',
                                    }}
                                >
                                    Additional details{' '}
                                    <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
                                </label>
                                <textarea
                                    id="report-details"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    rows={3}
                                    placeholder="Anything else to add?"
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem 0.75rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-secondary)',
                                        color: 'var(--text-main)',
                                        fontSize: '0.875rem',
                                        resize: 'none',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                        fontFamily: 'inherit',
                                    }}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <p style={{ fontSize: '0.8rem', color: '#e05252', marginBottom: '1rem' }}>
                                    {error}
                                </p>
                            )}

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '6px',
                                        border: '1px solid var(--border-color)',
                                        background: 'transparent',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        padding: '0.5rem 1.25rem',
                                        borderRadius: '6px',
                                        border: 'none',
                                        background: 'var(--text-main)',
                                        color: 'var(--bg-main)',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        opacity: isSubmitting ? 0.5 : 1,
                                    }}
                                >
                                    {isSubmitting ? 'Submitting…' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
