'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkAdminStatus } from '@/lib/moderation-queries';
import AdminReportsList from '@/components/AdminReportsList';

type CheckState =
    | { status: 'loading' }
    | { status: 'admin' }
    | { status: 'denied'; userId: string | null; role: string | null; errorMsg: string | null };

export default function AdminReportsPage() {
    const router = useRouter();
    const [check, setCheck] = useState<CheckState>({ status: 'loading' });

    useEffect(() => {
        checkAdminStatus().then(({ isAdmin, userId, role, errorMsg }) => {
            if (isAdmin) {
                setCheck({ status: 'admin' });
            } else {
                // Show why instead of silently redirecting
                setCheck({ status: 'denied', userId, role, errorMsg });
            }
        });
    }, []);

    // ── Loading ────────────────────────────────────────────────────────────
    if (check.status === 'loading') {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>Checking access…</p>
            </main>
        );
    }

    // ── Access denied — show diagnostic instead of silent redirect ─────────
    if (check.status === 'denied') {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.75rem' }}>
                        Access Denied
                    </p>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 300, color: 'var(--text-main)', marginBottom: '1.5rem' }}>
                        Admin access required
                    </h1>

                    {/* Diagnostic box */}
                    <div className="font-mono" style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem 1.25rem',
                        textAlign: 'left',
                        marginBottom: '1.5rem',
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.8,
                    }}>
                        <p><strong style={{ color: 'var(--text-tertiary)' }}>user_id:</strong> {check.userId ?? 'null (not logged in)'}</p>
                        <p><strong style={{ color: 'var(--text-tertiary)' }}>role:</strong> {check.role ?? 'null'}</p>
                        {check.errorMsg && (
                            <p><strong style={{ color: '#e05252' }}>error:</strong> {check.errorMsg}</p>
                        )}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                        To grant admin access, run this in Supabase SQL:
                    </p>
                    <code style={{
                        display: 'block',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        marginBottom: '1.5rem',
                        wordBreak: 'break-all',
                    }}>
                        UPDATE public.users SET role = &apos;admin&apos; WHERE id = &apos;{check.userId ?? 'YOUR_USER_ID'}&apos;;
                    </code>

                    <button
                        onClick={() => router.push('/feed')}
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
                        Back to feed
                    </button>
                </div>
            </main>
        );
    }

    // ── Authorised ─────────────────────────────────────────────────────────
    return (
        <main
            style={{
                minHeight: '100vh',
                background: 'var(--bg-main)',
                paddingBottom: '4rem',
            }}
        >
            <div
                style={{
                    maxWidth: '860px',
                    margin: '0 auto',
                    padding: '2.5rem 1.5rem 0',
                }}
            >
                {/* Header */}
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>
                        Admin
                    </p>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 300, letterSpacing: '0.03em', color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                        Moderation Reports
                    </h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Review, dismiss, or action all submitted reports. Status updates are manual only.
                    </p>
                    <div style={{ marginTop: '1.25rem', height: '1px', background: 'var(--border-color)' }} />
                </div>

                <AdminReportsList />
            </div>
        </main>
    );
}
