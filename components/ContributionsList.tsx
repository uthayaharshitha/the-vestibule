'use client';

import { useEffect, useState, useCallback } from 'react';
import { getContributions } from '@/lib/contribution-queries';
import { createContribution } from '@/lib/contribution-mutations';
import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Contribution } from '@/types/database';
import ReportButton from './ReportButton';
import Link from 'next/link';
import { useToast } from '@/contexts/ToastContext';

// Returns whether the current session is a guest (anonymous Supabase user)
async function checkIsGuest(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return true; // not logged in at all → treat as guest
    return user.is_anonymous === true;
}

interface ContributionsListProps {
    capsuleId: string;
    hideTitle?: boolean;
}

interface ContributionWithUser extends Contribution {
    parent_id?: string | null;
    users: {
        username: string | null;
        profile_image_url: string | null;
    } | null;
}

interface ThreadNode extends ContributionWithUser {
    replies: ThreadNode[];
}

// Build a nested tree from a flat list
function buildTree(flat: ContributionWithUser[]): ThreadNode[] {
    const map = new Map<string, ThreadNode>();
    const roots: ThreadNode[] = [];

    flat.forEach(c => {
        map.set(c.id, { ...c, replies: [] });
    });

    map.forEach(node => {
        if (node.parent_id && map.has(node.parent_id)) {
            map.get(node.parent_id)!.replies.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// ── Inline reply form ──────────────────────────────────────────────────────
function ReplyForm({
    capsuleId,
    parentId,
    onSuccess,
    onCancel,
    inheritBoxColor,
}: {
    capsuleId: string;
    parentId: string;
    onSuccess: () => void;
    onCancel: () => void;
    inheritBoxColor: string;
}) {
    const [text, setText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => {
        // Double-check they're a real user (not guest) — guests should not reach here
        // but guard anyway
        checkIsGuest().then(guest => setIsAuth(!guest));
    }, []);

    if (isAuth === null) return null;

    if (!isAuth) {
        return (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                <Link href="/login" style={{ textDecoration: 'underline', color: 'var(--text-secondary)' }}>Log in</Link> to reply.
            </p>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        await createContribution(capsuleId, text, 'writing', undefined, isAnonymous, inheritBoxColor, parentId);
        setSubmitting(false);
        setText('');
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={3}
                placeholder="Write a reply..."
                disabled={submitting}
                style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.875rem',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    color: 'var(--text-main)',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => setIsAnonymous(e.target.checked)}
                        disabled={submitting}
                    />
                    Anonymous
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                    <button type="button" onClick={onCancel} disabled={submitting}
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting || !text.trim()}
                        style={{ fontSize: '0.8rem', padding: '0.3rem 0.75rem', background: 'var(--text-main)', border: 'none', borderRadius: '4px', color: 'var(--bg-main)', cursor: 'pointer', opacity: submitting || !text.trim() ? 0.5 : 1 }}>
                        {submitting ? 'Posting...' : 'Reply'}
                    </button>
                </div>
            </div>
        </form>
    );
}

// ── Single contribution node (recursive) ──────────────────────────────────
function ContributionNode({
    node,
    capsuleId,
    depth,
    onReload,
}: {
    node: ThreadNode;
    capsuleId: string;
    depth: number;
    onReload: () => void;
}) {
    const [showReply, setShowReply] = useState(false);
    const [showReplies, setShowReplies] = useState(true);
    const { showToast } = useToast();

    const handleReplyClick = useCallback(async () => {
        const guest = await checkIsGuest();
        if (guest) {
            showToast('Sign in or create an account to reply.');
            return;
        }
        setShowReply(r => !r);
    }, [showToast]);

    const boxColor = node.box_color || '#F5F5F5';
    const textColor = getContrastColor(boxColor);
    const isLight = textColor === '#FFFFFF';
    const dimColor = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)';

    const displayName = node.is_anonymous
        ? 'Anonymous'
        : node.users?.username
            ? `@${node.users.username}`
            : 'Unknown';

    const profileHref = !node.is_anonymous && node.users?.username
        ? `/profile/${node.users.username}`
        : null;

    return (
        <div style={{
            marginLeft: depth > 0 ? `${Math.min(depth, 4) * 16}px` : 0,
            borderLeft: depth > 0 ? `2px solid ${isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'}` : 'none',
            paddingLeft: depth > 0 ? '12px' : 0,
            marginTop: depth > 0 ? '10px' : 0,
        }}>
            <div
                style={{
                    backgroundColor: boxColor,
                    border: `1px solid ${isLight ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '8px',
                    padding: '0.9rem 1rem',
                }}
            >
                {/* Header: avatar + name + date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
                    {/* Avatar */}
                    <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: dimColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!node.is_anonymous && node.users?.profile_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={node.users.profile_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <svg width="12" height="12" viewBox="0 0 20 20" fill={dimColor}>
                                <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm-7 8a7 7 0 1114 0H3z" />
                            </svg>
                        )}
                    </div>

                    {/* Name */}
                    {profileHref ? (
                        <Link href={profileHref} style={{ fontSize: '0.8rem', color: dimColor, textDecoration: 'none' }}>
                            {displayName}
                        </Link>
                    ) : (
                        <span style={{ fontSize: '0.8rem', color: dimColor }}>{displayName}</span>
                    )}

                    <span style={{ fontSize: '0.72rem', color: dimColor, marginLeft: 'auto' }}>
                        {new Date(node.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {node.is_edited && <em style={{ marginLeft: '0.35rem' }}>(edited)</em>}
                    </span>
                </div>

                {/* Content */}
                <p style={{ color: textColor, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem', margin: 0 }}>
                    {node.content_text}
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.65rem' }}>
                    <button
                        onClick={handleReplyClick}
                        style={{ fontSize: '0.75rem', color: dimColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                        {showReply ? 'Cancel' : 'Reply'}
                    </button>
                    {node.replies.length > 0 && (
                        <button
                            onClick={() => setShowReplies(r => !r)}
                            style={{ fontSize: '0.75rem', color: dimColor, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            {showReplies ? `▾ ${node.replies.length} repl${node.replies.length === 1 ? 'y' : 'ies'}` : `▸ ${node.replies.length} repl${node.replies.length === 1 ? 'y' : 'ies'}`}
                        </button>
                    )}
                    <span style={{ marginLeft: 'auto' }}>
                        <ReportButton targetType="contribution" targetId={node.id} />
                    </span>
                </div>

                {/* Inline reply form */}
                {showReply && (
                    <ReplyForm
                        capsuleId={capsuleId}
                        parentId={node.id}
                        inheritBoxColor={boxColor}
                        onSuccess={() => { setShowReply(false); onReload(); }}
                        onCancel={() => setShowReply(false)}
                    />
                )}
            </div>

            {/* Nested replies */}
            {showReplies && node.replies.map(reply => (
                <ContributionNode
                    key={reply.id}
                    node={reply}
                    capsuleId={capsuleId}
                    depth={depth + 1}
                    onReload={onReload}
                />
            ))}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function ContributionsList({ capsuleId, hideTitle }: ContributionsListProps) {
    const [tree, setTree] = useState<ThreadNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const { showToast } = useToast();

    const handleAddClick = useCallback(async () => {
        const guest = await checkIsGuest();
        if (guest) {
            showToast('Sign in or create an account to contribute.');
            return;
        }
        setShowForm(f => !f);
    }, [showToast]);

    const load = async () => {
        setLoading(true);
        const { contributions } = await getContributions(capsuleId);
        setTree(buildTree(contributions as ContributionWithUser[]));
        setLoading(false);
    };

    useEffect(() => {
        load();

        const channel = supabase
            .channel(`contributions:${capsuleId}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions', filter: `capsule_id=eq.${capsuleId}` }, load)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [capsuleId]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {!hideTitle && (
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                        Contributions
                    </h2>
                )}
                <button
                    onClick={handleAddClick}
                    style={{ padding: '0.4rem 1rem', background: 'var(--text-main)', color: 'var(--bg-main)', border: 'none', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                    {showForm ? 'Cancel' : 'Add Contribution'}
                </button>
            </div>

            {/* Top-level new contribution form */}
            {showForm && (
                <TopLevelForm
                    capsuleId={capsuleId}
                    onSuccess={() => { setShowForm(false); load(); }}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>Loading…</div>
            ) : tree.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)' }}>
                    No contributions yet. Be the first to share.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {tree.map(node => (
                        <ContributionNode key={node.id} node={node} capsuleId={capsuleId} depth={0} onReload={load} />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Top-level contribution form ────────────────────────────────────────────
function TopLevelForm({ capsuleId, onSuccess, onCancel }: { capsuleId: string; onSuccess: () => void; onCancel: () => void }) {
    const [text, setText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [boxColor, setBoxColor] = useState('#F5F5F5');
    const [boxHex, setBoxHex] = useState('#F5F5F5');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAuth, setIsAuth] = useState<boolean | null>(null);

    useEffect(() => { getCurrentUser().then(u => setIsAuth(!!u)); }, []);

    if (isAuth === null) return null;

    if (!isAuth) {
        return (
            <div style={{ padding: '1.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>Sign in to leave a contribution.</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Link href="/login" style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', background: 'var(--text-main)', color: 'var(--bg-main)', fontSize: '0.85rem', textDecoration: 'none' }}>Log In</Link>
                    <Link href="/signup" style={{ padding: '0.5rem 1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-main)', fontSize: '0.85rem', textDecoration: 'none' }}>Sign Up</Link>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) { setError('Please write something.'); return; }
        setSubmitting(true); setError(null);
        const { error: submitError } = await createContribution(capsuleId, text, 'writing', undefined, isAnonymous, boxColor);
        setSubmitting(false);
        if (submitError) { setError('Failed to submit. Please try again.'); return; }
        setText(''); setBoxColor('#F5F5F5'); setBoxHex('#F5F5F5');
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-main)' }}>
            <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={5}
                placeholder="SHARE YOUR THOUGHTS, REFLECTIONS, OR CREATIVE WRITING..."
                className="archive-input resize-none"
                disabled={submitting}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} disabled={submitting} />
                    Post anonymously
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Box color:</label>
                    <input type="color" value={boxColor} onChange={e => { setBoxColor(e.target.value); setBoxHex(e.target.value); }} style={{ width: '36px', height: '28px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', padding: '1px' }} disabled={submitting} />
                    <input type="text" value={boxHex} onChange={e => { setBoxHex(e.target.value); if (/^#[0-9A-F]{6}$/i.test(e.target.value)) setBoxColor(e.target.value); }} style={{ width: '88px', padding: '0.25rem 0.5rem', fontSize: '0.8rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-secondary)', color: 'var(--text-main)' }} disabled={submitting} />
                </div>
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>{error}</p>}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onCancel} disabled={submitting} style={{ padding: '0.45rem 1rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="archive-btn" style={{ padding: '0.45rem 1.25rem', fontSize: '0.875rem' }}>
                    {submitting ? 'Submitting…' : 'Submit'}
                </button>
            </div>
        </form>
    );
}
