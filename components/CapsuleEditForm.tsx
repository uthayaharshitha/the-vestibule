'use client';

import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { updateCapsule, attachMediaToCapsule } from '@/lib/capsule-mutations';
import { useMediaUploadQueue } from '@/lib/useMediaUploadQueue';
import { useCapsuleUpload } from '@/contexts/CapsuleUploadContext';
import { useToast } from '@/contexts/ToastContext';
import { supabase } from '@/lib/supabase';
import TagInput from '@/components/TagInput';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

interface CapsuleEditFormProps { capsuleId: string; }

interface SingleUpload {
    file: File;
    previewUrl: string;
    status: 'uploading' | 'done' | 'error';
    progress: number;
    uploadedUrl: string | null;
}

function ProgressBar({ pct, done, error }: { pct: number; done: boolean; error: boolean }) {
    return (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.15)' }}>
            <div style={{
                height: '100%', width: `${pct}%`,
                background: error ? '#ef4444' : done ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)',
                transition: 'width 0.2s ease, background 0.3s ease',
            }} />
        </div>
    );
}

function UploadTile({ previewUrl, isVideo, progress, status, onRemove, onRetry, fileName }: {
    previewUrl: string; isVideo: boolean; progress: number; status: string;
    onRemove: () => void; onRetry?: () => void; fileName?: string;
}) {
    const [tapped, setTapped] = useState(false);
    return (
        <div 
            className="relative aspect-square rounded overflow-hidden group" 
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', animation: 'fadeInUp 0.2s ease both' }}
            onClick={() => setTapped(!tapped)}
        >
            {isVideo ? <video src={previewUrl} className="w-full h-full object-cover" muted playsInline /> : <img src={previewUrl} alt={fileName} className="w-full h-full object-cover" />}
            {status === 'uploading' && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />}
            {status === 'done' && <div style={{ position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>✓</div>}
            {status === 'error' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', gap: 4 }}>
                    <span style={{ color: '#f87171', fontSize: 10 }}>Failed</span>
                    {onRetry && <button type="button" onClick={onRetry} style={{ fontSize: 9, color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}>retry</button>}
                </div>
            )}
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className={`absolute top-0 right-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pt-1 pr-1 pb-2 pl-2 ${tapped ? 'opacity-100' : 'opacity-0'}`}
                style={{ minWidth: 44, minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
                <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, lineHeight: 1, pointerEvents: 'none'
                }}>×</div>
            </button>
            <ProgressBar pct={progress} done={status === 'done'} error={status === 'error'} />
        </div>
    );
}

export default function CapsuleEditForm({ capsuleId }: CapsuleEditFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const { startPosting, finishPosting } = useCapsuleUpload();

    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themeColor, setThemeColor] = useState('#F5F5F5');
    const [themeColorHex, setThemeColorHex] = useState('#F5F5F5');
    const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
    const [fragranceNotes, setFragranceNotes] = useState<string[]>([]);
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [existingAudio, setExistingAudio] = useState<any[]>([]);
    const [mediaToRemove, setMediaToRemove] = useState<string[]>([]);
    const [audioToRemove, setAudioToRemove] = useState<string[]>([]);
    const [coverUpload, setCoverUpload] = useState<SingleUpload | null>(null);
    const [audioUpload, setAudioUpload] = useState<SingleUpload | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [initialState, setInitialState] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tappedMediaId, setTappedMediaId] = useState<string | null>(null);

    const { items: newMediaItems, addFiles, removeFile, retryFile, clearAll, uploadingCount } = useMediaUploadQueue('capsule-media');
    const userIdRef = useRef<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => { userIdRef.current = data.user?.id ?? null; });
    }, []);

    const getUserId = () => userIdRef.current ?? 'anonymous';

    useEffect(() => {
        const fetchData = async () => {
            const { data: capsule, error: capsuleError } = await supabase.from('capsules').select('title, description, theme_color, cover_image_url').eq('id', capsuleId).single();
            if (capsuleError) { setError('Failed to load capsule.'); setLoading(false); return; }

            const { data: notes } = await supabase.from('capsule_notes').select('note_text').eq('capsule_id', capsuleId).order('order_index');
            const { data: media } = await supabase.from('capsule_media').select('*').eq('capsule_id', capsuleId).order('order_index');
            const { data: audio } = await supabase.from('capsule_audio').select('*').eq('capsule_id', capsuleId);

            if (capsule) {
                setTitle(capsule.title);
                setDescription(capsule.description || '');
                const color = capsule.theme_color || '#F5F5F5';
                setThemeColor(color); setThemeColorHex(color);
                setExistingCoverUrl(capsule.cover_image_url);
            }
            if (notes?.length) setFragranceNotes(notes.map((n: any) => n.note_text));
            if (media) setExistingMedia(media);
            if (audio) setExistingAudio(audio);

            if (capsule) {
                setInitialState({
                    title: capsule.title,
                    description: capsule.description || '',
                    themeColor: capsule.theme_color || '#F5F5F5',
                    fragranceNotes: notes?.length ? notes.map((n: any) => n.note_text) : []
                });
            }

            setLoading(false);
        };
        fetchData();
    }, [capsuleId]);

    const isDirty = initialState && !isSubmitting && (
        title !== initialState.title ||
        description !== initialState.description ||
        themeColor !== initialState.themeColor ||
        coverUpload !== null ||
        audioUpload !== null ||
        newMediaItems.length > 0 ||
        mediaToRemove.length > 0 ||
        audioToRemove.length > 0 ||
        JSON.stringify(fragranceNotes) !== JSON.stringify(initialState.fragranceNotes)
    );
    useUnsavedChanges(!!isDirty);

    // ── Single file upload helper ────────────────────────────────────────────
    const uploadSingleFile = async (file: File, pathPrefix: string, contentType: string, setter: Dispatch<SetStateAction<SingleUpload | null>>) => {
        const previewUrl = URL.createObjectURL(file);
        setter({ file, previewUrl, status: 'uploading', progress: 0, uploadedUrl: null });
        const fileExt = file.name.split('.').pop() ?? 'bin';
        const fileName = `${pathPrefix}/${crypto.randomUUID()}.${fileExt}`;
        try {
            const { data: signedData, error: signedError } = await supabase.storage.from('capsule-media').createSignedUploadUrl(fileName);
            if (signedError || !signedData) throw signedError ?? new Error('No signed URL');
            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', (ev) => { if (ev.lengthComputable) setter(prev => prev ? { ...prev, progress: Math.round((ev.loaded / ev.total) * 100) } : prev); });
                xhr.addEventListener('load', () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`${xhr.status}`)));
                xhr.addEventListener('error', () => reject(new Error('Network error')));
                xhr.open('PUT', signedData.signedUrl);
                xhr.setRequestHeader('Content-Type', contentType);
                xhr.send(file);
            });
            const { data: { publicUrl } } = supabase.storage.from('capsule-media').getPublicUrl(fileName);
            setter(prev => prev ? { ...prev, status: 'done', progress: 100, uploadedUrl: publicUrl } : prev);
            return publicUrl;
        } catch {
            setter(prev => prev ? { ...prev, status: 'error' } : prev);
            return null;
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        uploadSingleFile(file, `${getUserId()}/covers`, file.type || 'image/jpeg', setCoverUpload);
        e.target.value = '';
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        const audioTypeMap: Record<string, string> = { mp3: 'audio/mpeg', mp4: 'audio/mp4', m4a: 'audio/mp4', wav: 'audio/wav', ogg: 'audio/ogg', webm: 'audio/webm', aac: 'audio/aac', flac: 'audio/flac' };
        uploadSingleFile(file, `${getUserId()}/${capsuleId}/audio`, audioTypeMap[ext] ?? 'audio/mpeg', setAudioUpload);
        if (existingAudio.length > 0) { setAudioToRemove(existingAudio.map((a: any) => a.id)); setExistingAudio([]); }
        e.target.value = '';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        addFiles(files, `${getUserId()}/${capsuleId}/media`);
        e.target.value = '';
    };

    const handleRemoveMedia = (mediaId: string) => { setMediaToRemove(prev => [...prev, mediaId]); setExistingMedia(prev => prev.filter(m => m.id !== mediaId)); };
    const handleRemoveAudio = (audioId: string) => { setAudioToRemove(prev => [...prev, audioId]); setExistingAudio(prev => prev.filter(a => a.id !== audioId)); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }

        const pendingUploads = uploadingCount + (coverUpload?.status === 'uploading' ? 1 : 0) + (audioUpload?.status === 'uploading' ? 1 : 0);
        if (pendingUploads > 0) { setError('Please wait for uploads to finish.'); return; }

        setError(null);
        setIsSubmitting(true);

        const coverImageUrl = coverUpload?.uploadedUrl ?? undefined;
        const audioUrl = audioUpload?.uploadedUrl ?? undefined;
        const newMedia = newMediaItems.filter(i => i.status === 'done' && i.uploadedUrl).map(i => ({ url: i.uploadedUrl!, type: (i.file.type.startsWith('video') ? 'video' : 'image') as 'image' | 'video' }));

        // Navigate back immediately
        router.push(`/capsule/${capsuleId}`);
        router.refresh();

        startPosting('Saving changes\u2026');

        // Background: update metadata + attach new media
        Promise.all([
            updateCapsule({ capsuleId, title, description, themeColor, coverImage: undefined, fragranceNotes, mediaIdsToRemove: mediaToRemove.length > 0 ? mediaToRemove : undefined, audioIdsToRemove: audioToRemove.length > 0 ? audioToRemove : undefined }),
            attachMediaToCapsule(capsuleId, newMedia, audioUrl, audioToRemove.length > 0 ? audioToRemove : undefined, undefined)
        ]).then(() => {
            finishPosting();
            showToast('Capsule updated quietly.');
        }).catch(() => {
            finishPosting();
            showToast('Some changes may not have saved. Please check.');
        });

        clearAll();
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)', padding: '2rem' }}>[ Loading capsule data... ]</div>;

    return (
        <>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Edit Capsule</h2>

                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Title (Required)</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="archive-input" placeholder="ENTER CAPSULE TITLE" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Description (Optional)</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="archive-input min-h-[100px] resize-none" placeholder="DESCRIBE THIS MEMORY..." />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Theme Color</label>
                    <div className="flex gap-4 items-center">
                        <input type="color" value={themeColor} onChange={(e) => { setThemeColor(e.target.value); setThemeColorHex(e.target.value); }} className="w-20 h-10 border rounded cursor-pointer" style={{ borderColor: 'var(--border-color)' }} />
                        <input type="text" value={themeColorHex} onChange={(e) => { setThemeColorHex(e.target.value); if (/^#[0-9A-F]{6}$/i.test(e.target.value)) setThemeColor(e.target.value); }} placeholder="#F5F5F5" className="archive-input flex-1" />
                    </div>
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Cover Image</label>
                    {existingCoverUrl && !coverUpload && (
                        <div className="mb-2">
                            <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Current cover:</p>
                            <img src={existingCoverUrl} alt="Current cover" className="w-32 h-32 object-cover rounded" style={{ border: '1px solid var(--border-color)' }} />
                        </div>
                    )}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                        {existingCoverUrl ? 'Replace cover' : 'Add cover image'}
                        <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                    </label>
                    {coverUpload && (
                        <div className="mt-2 relative inline-block" style={{ width: 120, height: 120 }}>
                            <img src={coverUpload.previewUrl} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                            {coverUpload.status === 'done' && <div style={{ position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>✓</div>}
                            <button type="button" onClick={() => setCoverUpload(null)} style={{ position: 'absolute', top: -8, right: -8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, pointerEvents: 'none' }}>×</div>
                            </button>
                        </div>
                    )}
                </div>

                <TagInput label="Sensory Notes" tags={fragranceNotes} onChange={setFragranceNotes} max={20} placeholder="Type and press Enter (e.g. old books, rain, ozone)" />

                {/* Existing Media */}
                {existingMedia.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Existing Media</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {existingMedia.map((media) => (
                                <div key={media.id} onClick={() => setTappedMediaId(tappedMediaId === media.id ? null : media.id)} className="relative aspect-square rounded overflow-hidden group" style={{ border: '1px solid var(--border-color)' }}>
                                    {media.media_type === 'image' ? <img src={media.file_url} alt="Media" className="w-full h-full object-cover" /> : <video src={media.file_url} className="w-full h-full object-cover" muted />}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleRemoveMedia(media.id); }}
                                        className={`absolute top-0 right-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pt-1 pr-1 pb-2 pl-2 ${tappedMediaId === media.id ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ minWidth: 44, minHeight: 44, background: 'transparent', border: 'none', cursor: 'pointer' }}
                                    >
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%',
                                            background: 'rgba(220,38,38,0.8)', color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: 12, pointerEvents: 'none'
                                        }}>×</div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add New Media */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Add Images / Videos</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                        Choose files
                        <input type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>
                    {newMediaItems.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                            {newMediaItems.map((item) => (
                                <UploadTile key={item.id} previewUrl={item.previewUrl} isVideo={item.file.type.startsWith('video')} progress={item.progress} status={item.status} fileName={item.file.name} onRemove={() => removeFile(item.id)} onRetry={() => retryFile(item.id, `${getUserId()}/${capsuleId}/media`)} />
                            ))}
                        </div>
                    )}
                    {uploadingCount > 0 && <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Uploading {uploadingCount} file{uploadingCount !== 1 ? 's' : ''}…</p>}
                </div>

                {/* Audio */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Ambient Audio</label>
                    {existingAudio.length > 0 && existingAudio.map((audio) => (
                        <div key={audio.id} className="flex items-center gap-3 mb-3 p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                            <audio src={audio.file_url} controls className="flex-1 h-8" style={{ minWidth: 0 }} />
                            <button type="button" onClick={() => handleRemoveAudio(audio.id)} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}>Remove</button>
                        </div>
                    ))}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg>
                        {existingAudio.length > 0 ? 'Replace audio' : 'Add ambient audio'}
                        <input type="file" accept="audio/*" onChange={handleAudioChange} style={{ display: 'none' }} />
                    </label>
                    {audioUpload && (
                        <div className="mt-2 flex items-center gap-3 p-3 rounded" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {audioUpload.status === 'done' ? '✓ ' : audioUpload.status === 'error' ? '✗ ' : ''}{audioUpload.file.name}
                            </span>
                            <button type="button" onClick={() => setAudioUpload(null)} style={{ fontSize: 16, padding: '10px 14px', margin: '-10px -14px', color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
                            <ProgressBar pct={audioUpload.progress} done={audioUpload.status === 'done'} error={audioUpload.status === 'error'} />
                        </div>
                    )}
                </div>

                {error && <div className="p-3 text-sm rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

                <div className="flex gap-4">
                    <button type="button" onClick={() => {
                        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
                        router.back();
                    }} className="archive-btn opacity-60 hover:opacity-100">CANCEL</button>
                    <button type="submit" className="archive-btn">SAVE CHANGES</button>
                </div>
            </form>
        </>
    );
}
