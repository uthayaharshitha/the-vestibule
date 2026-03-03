'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';
import { softDeleteCapsule } from '@/lib/capsule-mutations';
import { useToast } from '@/contexts/ToastContext';

interface MyCapsule {
    id: string;
    title: string;
    created_at: string;
    status: string;
    visibility: string;
    theme_color: string | null;
    capsule_media: { file_url: string; media_type: string }[];
}

// Helper function to calculate text color based on background luminance
function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

export default function MyCapsulesPage() {
    const [loading, setLoading] = useState(true);
    const [capsules, setCapsules] = useState<MyCapsule[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        const loadData = async () => {
            const user = await getCurrentUser();
            if (user) {
                fetchCapsules(user.id);
            }
        };
        loadData();
    }, []);

    const fetchCapsules = async (userId: string) => {
        const { data, error } = await supabase
            .from('capsules')
            .select(`
                id,
                title,
                created_at,
                status,
                visibility,
                theme_color,
                capsule_media (file_url, media_type)
            `)
            .eq('creator_id', userId)
            .neq('status', 'removed')
            .order('created_at', { ascending: false });

        if (data) {
            setCapsules(data as any);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this capsule? This cannot be undone.')) return;

        const { error } = await softDeleteCapsule(id);
        if (error) {
            alert('Failed to delete capsule ' + error.message);
        } else {
            // Optimistic update
            setCapsules(prev => prev.filter(c => c.id !== id));
            showToast('Capsule moved to archive.');
        }
    };

    if (loading) return <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading capsules...</div>;

    if (capsules.length === 0) {
        return (
            <div className="py-12 text-center" style={{ color: 'var(--text-tertiary)' }}>
                <p>Nothing here yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {capsules.map((capsule) => {
                const themeColor = capsule.theme_color || '#F5F5F5';
                const textColor = getContrastColor(themeColor);
                const isLightText = textColor === '#FFFFFF';

                return (
                    <div
                        key={capsule.id}
                        className="group flex flex-col rounded-md overflow-hidden"
                        style={{
                            backgroundColor: themeColor,
                            border: `1px solid ${isLightText ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`
                        }}
                    >
                        <Link href={`/capsule/${capsule.id}`} className="block relative aspect-video overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            {capsule.capsule_media?.[0] ? (
                                capsule.capsule_media[0].media_type === 'video' ? (
                                    <video
                                        src={capsule.capsule_media[0].file_url}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        muted
                                    />
                                ) : (
                                    <img
                                        src={capsule.capsule_media[0].file_url}
                                        alt={capsule.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                )
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: isLightText ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)' }}>
                                    [ NO MEDIA ]
                                </div>
                            )}

                            <div className="absolute top-2 right-2 flex gap-1">
                                <span className="px-2 py-1 bg-black/50 text-white text-[10px] uppercase rounded backdrop-blur-sm">
                                    {capsule.status}
                                </span>
                                <span className="px-2 py-1 bg-black/50 text-white text-[10px] uppercase rounded backdrop-blur-sm">
                                    {capsule.visibility}
                                </span>
                            </div>
                        </Link>

                        <div className="p-4 flex-1 flex flex-col">
                            <Link href={`/capsule/${capsule.id}`} className="block">
                                <h3 className="font-bold hover:underline truncate" style={{ color: textColor }}>
                                    {capsule.title}
                                </h3>
                                <p className="text-xs mt-1 uppercase mb-4" style={{ color: isLightText ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)' }}>
                                    {new Date(capsule.created_at).toLocaleDateString()}
                                </p>
                            </Link>

                            <div className="mt-auto flex gap-2 pt-4" style={{ borderTop: `1px solid ${isLightText ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}` }}>
                                <Link
                                    href={`/edit-capsule/${capsule.id}`}
                                    className="flex-1 py-2 text-center text-xs font-bold uppercase rounded transition-all hover:opacity-80"
                                    style={{
                                        border: `1px solid ${isLightText ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
                                        color: textColor
                                    }}
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(capsule.id)}
                                    className="flex-1 py-2 text-center text-xs font-bold uppercase rounded transition-all hover:opacity-80"
                                    style={{
                                        border: '1px solid rgba(239, 68, 68, 0.5)',
                                        color: '#ef4444',
                                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div >
    );
}
