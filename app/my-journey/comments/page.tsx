'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import Link from 'next/link';

interface MyContribution {
    id: string;
    capsule_id: string;
    capsule_title: string;
    content_text: string | null;
    created_at: string;
    status: string;
    is_edited?: boolean;
}

export default function MyCommentsPage() {
    const [loading, setLoading] = useState(true);
    const [contributions, setContributions] = useState<MyContribution[]>([]);

    // Auth check is handled by layout, but we need user ID for fetching
    useEffect(() => {
        const loadData = async () => {
            const user = await getCurrentUser();
            if (user) {
                fetchContributions(user.id);
            }
        };
        loadData();
    }, []);

    const fetchContributions = async (userId: string) => {
        const { data, error } = await supabase
            .from('contributions')
            .select(`
                id, 
                capsule_id, 
                content_text, 
                created_at, 
                status,
                is_edited,
                capsules (title)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (data) {
            const formatted = data.map((item: any) => ({
                id: item.id,
                capsule_id: item.capsule_id,
                capsule_title: item.capsules?.title || 'Unknown Capsule',
                content_text: item.content_text,
                created_at: item.created_at,
                status: item.status,
                is_edited: item.is_edited
            }));
            setContributions(formatted);
        }
        setLoading(false);
    };

    // Editing State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const startEdit = (contribution: MyContribution) => {
        setEditingId(contribution.id);
        setEditText(contribution.content_text || '');
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText('');
    };

    const saveEdit = async (id: string) => {
        const { error } = await supabase
            .from('contributions')
            .update({
                content_text: editText,
                status: 'active',
                is_edited: true
            })
            .eq('id', id);

        if (error) {
            alert('Failed to update');
            console.error(error);
        } else {
            setContributions(prev => prev.map(c =>
                c.id === id ? { ...c, content_text: editText } : c
            ));
            setEditingId(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to erase this trace?')) return;

        const { error } = await supabase
            .from('contributions')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Failed to delete');
            console.error(error);
        } else {
            setContributions(prev => prev.filter(c => c.id !== id));
        }
    };

    if (loading) return <div className="text-gray-500 text-sm">Loading comments...</div>;

    if (contributions.length === 0) {
        return (
            <div className="py-12 text-center text-gray-400 text-sm">
                [ No comments or traces left yet ]
            </div>
        );
    }

    return (
        <ul className="space-y-8 divide-y divide-gray-100">
            {contributions.map((contribution) => (
                <li key={contribution.id} className="pt-8 first:pt-0">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-baseline text-xs text-gray-400">
                            <span className="uppercase tracking-wide">
                                {new Date(contribution.created_at).toLocaleDateString()}
                            </span>
                            <div className="flex gap-3">
                                {editingId === contribution.id ? (
                                    <>
                                        <button onClick={() => saveEdit(contribution.id)} className="text-green-600 hover:underline">[SAVE]</button>
                                        <button onClick={cancelEdit} className="text-gray-500 hover:underline">[CANCEL]</button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => startEdit(contribution)} className="hover:text-black transition-colors">[EDIT]</button>
                                        <button onClick={() => handleDelete(contribution.id)} className="hover:text-red-600 transition-colors">[DELETE]</button>
                                    </>
                                )}
                                <span className={`px-2 py-0.5 rounded-md border ${contribution.status === 'active' ? 'border-gray-200 text-gray-600' : 'border-yellow-200 text-yellow-600'
                                    }`}>
                                    {contribution.status}
                                </span>
                            </div>
                        </div>

                        <div className="block group">
                            <Link href={`/capsule/${contribution.capsule_id}`} className="inline-block">
                                <h3 className="text-sm font-bold text-gray-900 hover:underline mb-1">
                                    Capsule: {contribution.capsule_title}
                                </h3>
                            </Link>

                            {editingId === contribution.id ? (
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full mt-2 p-2 text-sm border border-gray-300 focus:outline-none focus:border-black min-h-[100px]"
                                />
                            ) : (
                                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                                    "{contribution.content_text}"
                                    {contribution.is_edited && (
                                        <span className="text-[10px] text-gray-400 italic ml-2">(edited)</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
}
