'use client';

import { useEffect, useState } from 'react';
import { getAllReports } from '@/lib/moderation-queries';
import {
    updateContributionStatus,
    updateCapsuleStatus,
    updateReportStatus,
} from '@/lib/moderation-mutations';
import Link from 'next/link';

type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'action_taken';

const STATUS_TABS: { label: string; value: ReportStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Reviewed', value: 'reviewed' },
    { label: 'Dismissed', value: 'dismissed' },
    { label: 'Action Taken', value: 'action_taken' },
];

const STATUS_COLORS: Record<ReportStatus, { bg: string; text: string }> = {
    pending: { bg: '#fef3c7', text: '#92400e' },
    reviewed: { bg: '#dbeafe', text: '#1e40af' },
    dismissed: { bg: '#f3f4f6', text: '#6b7280' },
    action_taken: { bg: '#fee2e2', text: '#991b1b' },
};

interface Report {
    id: string;
    reporter_id: string | null;
    target_type: 'capsule' | 'contribution';
    target_id: string;
    reason: string;
    additional_details?: string | null;
    status: ReportStatus;
    created_at: string;
    contributions?: {
        id: string;
        content_text: string;
        content_type: string;
        status: string;
    } | null;
    capsules?: {
        id: string;
        title: string;
        status: string;
    } | null;
}

export default function AdminReportsList() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ReportStatus | 'all'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const loadReports = async () => {
        setLoading(true);
        const { reports: data } = await getAllReports();
        setReports(data as Report[]);
        setLoading(false);
    };

    useEffect(() => { loadReports(); }, []);

    // ── Admin actions ─────────────────────────────────────────────────────────

    const handleMarkReviewed = async (reportId: string) => {
        setProcessingId(reportId);
        await updateReportStatus(reportId, 'reviewed');
        setProcessingId(null);
        loadReports();
    };

    const handleDismiss = async (reportId: string) => {
        setProcessingId(reportId);
        await updateReportStatus(reportId, 'dismissed');
        setProcessingId(null);
        loadReports();
    };

    const handleRemoveContent = async (report: Report) => {
        if (!confirm('Remove this content? This updates its status to "removed" and marks the report as action taken.')) return;
        setProcessingId(report.id);
        if (report.target_type === 'contribution') {
            await updateContributionStatus(report.target_id, 'removed');
        } else if (report.target_type === 'capsule') {
            await updateCapsuleStatus(report.target_id, 'removed');
        }
        await updateReportStatus(report.id, 'action_taken');
        setProcessingId(null);
        loadReports();
    };

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = activeTab === 'all'
        ? reports
        : reports.filter((r) => r.status === activeTab);

    const pendingCount = reports.filter((r) => r.status === 'pending').length;

    // ── Styles ────────────────────────────────────────────────────────────────
    const card: React.CSSProperties = {
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
    };

    const label: React.CSSProperties = {
        fontSize: '0.7rem',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-tertiary)',
        marginBottom: '0.2rem',
    };

    const value: React.CSSProperties = {
        fontSize: '0.875rem',
        color: 'var(--text-main)',
    };

    const actionBtn = (variant: 'default' | 'danger' | 'ghost'): React.CSSProperties => ({
        padding: '0.375rem 0.875rem',
        borderRadius: '5px',
        border: variant === 'ghost' ? '1px solid var(--border-color)' : 'none',
        background: variant === 'danger' ? '#dc2626' : variant === 'default' ? 'var(--text-main)' : 'transparent',
        color: variant === 'danger' ? '#fff' : variant === 'default' ? 'var(--bg-main)' : 'var(--text-secondary)',
        fontSize: '0.8rem',
        cursor: 'pointer',
        fontWeight: 500,
        transition: 'opacity 0.15s',
    });

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                Loading reports…
            </div>
        );
    }

    return (
        <div>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                {STATUS_TABS.map(({ label: tabLabel, value: tabValue }) => {
                    const isActive = activeTab === tabValue;
                    return (
                        <button
                            key={tabValue}
                            onClick={() => setActiveTab(tabValue)}
                            style={{
                                padding: '0.375rem 1rem',
                                borderRadius: '20px',
                                border: '1px solid var(--border-color)',
                                background: isActive ? 'var(--text-main)' : 'transparent',
                                color: isActive ? 'var(--bg-main)' : 'var(--text-secondary)',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                fontWeight: isActive ? 500 : 400,
                                transition: 'all 0.15s',
                            }}
                        >
                            {tabLabel}
                            {tabValue === 'pending' && pendingCount > 0 && (
                                <span style={{
                                    marginLeft: '0.4rem',
                                    background: '#dc2626',
                                    color: '#fff',
                                    borderRadius: '10px',
                                    padding: '0 0.4rem',
                                    fontSize: '0.7rem',
                                }}>
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Empty */}
            {filtered.length === 0 && (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.875rem',
                }}>
                    No reports in this category.
                </div>
            )}

            {/* Report cards */}
            {filtered.map((report) => {
                const sc = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
                const isExpanded = expandedId === report.id;
                const isProcessing = processingId === report.id;
                const shortId = report.id.slice(0, 8);

                return (
                    <div key={report.id} style={card}>
                        {/* Top row: meta + status */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <p style={{ ...label }}>
                                    {report.target_type === 'capsule' ? '🗂 Capsule' : '💬 Contribution'} Report
                                    {' · '}
                                    <span className="font-mono" style={{ fontSize: '0.7rem' }}>#{shortId}</span>
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.1rem' }}>
                                    {new Date(report.created_at).toLocaleString()}
                                </p>
                            </div>
                            <span style={{
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: sc.bg,
                                color: sc.text,
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                                flexShrink: 0,
                            }}>
                                {report.status.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1rem' }}>
                            <div>
                                <p style={label}>Reason</p>
                                <p style={value}>{report.reason}</p>
                            </div>
                            <div>
                                <p style={label}>Reporter ID</p>
                                <p className="font-mono" style={{ ...value, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {report.reporter_id ? report.reporter_id.slice(0, 12) + '…' : 'Anonymous'}
                                </p>
                            </div>
                        </div>

                        {/* Additional details */}
                        {report.additional_details && (
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={label}>Additional Details</p>
                                <p style={{ ...value, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    {report.additional_details}
                                </p>
                            </div>
                        )}

                        {/* Linked content preview */}
                        {report.target_type === 'capsule' && report.capsules && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                border: '1px solid var(--border-color)',
                            }}>
                                <p style={label}>Reported Capsule</p>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <p style={{ ...value, fontWeight: 500 }}>{report.capsules.title}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{ fontSize: '0.7rem', color: report.capsules.status === 'removed' ? '#dc2626' : 'var(--text-tertiary)' }}>
                                            {report.capsules.status}
                                        </span>
                                        <Link
                                            href={`/capsule/${report.capsules.id}`}
                                            target="_blank"
                                            style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textDecoration: 'none' }}
                                        >
                                            View ↗
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {report.target_type === 'contribution' && report.contributions && (
                            <div style={{
                                padding: '0.75rem 1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                border: '1px solid var(--border-color)',
                            }}>
                                <p style={label}>Reported Contribution ({report.contributions.content_type})</p>
                                <p style={{ ...value, color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem', whiteSpace: 'pre-wrap' }}>
                                    {isExpanded
                                        ? report.contributions.content_text
                                        : (report.contributions.content_text || '').slice(0, 180) + ((report.contributions.content_text || '').length > 180 ? '…' : '')}
                                </p>
                                {(report.contributions.content_text || '').length > 180 && (
                                    <button
                                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--text-tertiary)', padding: '0.25rem 0 0', marginTop: '0.25rem' }}
                                    >
                                        {isExpanded ? 'Show less' : 'Show all'}
                                    </button>
                                )}
                                <p style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: report.contributions.status === 'removed' ? '#dc2626' : 'var(--text-tertiary)' }}>
                                    Status: {report.contributions.status}
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        {report.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <button
                                    onClick={() => handleMarkReviewed(report.id)}
                                    disabled={isProcessing}
                                    style={{ ...actionBtn('default'), opacity: isProcessing ? 0.4 : 1 }}
                                >
                                    Mark Reviewed
                                </button>
                                <button
                                    onClick={() => handleDismiss(report.id)}
                                    disabled={isProcessing}
                                    style={{ ...actionBtn('ghost'), opacity: isProcessing ? 0.4 : 1 }}
                                >
                                    Dismiss
                                </button>
                                <button
                                    onClick={() => handleRemoveContent(report)}
                                    disabled={isProcessing}
                                    style={{ ...actionBtn('danger'), opacity: isProcessing ? 0.4 : 1 }}
                                >
                                    {isProcessing ? 'Processing…' : 'Remove Content'}
                                </button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
