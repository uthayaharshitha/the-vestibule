'use client';

import { useState, useEffect, useRef, Dispatch, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { createCapsuleRecord } from '@/lib/capsule-mutations';
import { useMediaUploadQueue } from '@/lib/useMediaUploadQueue';
import { useCapsuleUpload } from '@/contexts/CapsuleUploadContext';
import { useToast } from '@/contexts/ToastContext';
import TagInput from '@/components/TagInput';
import { supabase } from '@/lib/supabase';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

// ─── Tiny helper: single-file upload state ───────────────────────────────────
interface SingleUpload {
    file: File;
    previewUrl: string;
    status: 'uploading' | 'done' | 'error';
    progress: number;
    uploadedUrl: string | null;
}

function ProgressBar({ pct, done, error }: { pct: number; done: boolean; error: boolean }) {
    return (
        <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '3px', background: 'rgba(255,255,255,0.15)',
        }}>
            <div style={{
                height: '100%',
                width: `${pct}%`,
                background: error ? '#ef4444' : done ? 'var(--text-secondary)' : 'rgba(255,255,255,0.7)',
                transition: 'width 0.2s ease, background 0.3s ease',
            }} />
        </div>
    );
}

function UploadTile({
    previewUrl, isVideo, progress, status, onRemove, onRetry, fileName,
}: {
    previewUrl: string;
    isVideo: boolean;
    progress: number;
    status: string;
    onRemove: () => void;
    onRetry?: () => void;
    fileName?: string;
}) {
    const [tapped, setTapped] = useState(false);
    return (
        <div
            className="relative aspect-square rounded overflow-hidden group"
            style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                animation: 'fadeInUp 0.2s ease both',
            }}
            onClick={() => setTapped(!tapped)}
        >
            {isVideo ? (
                <video src={previewUrl} className="w-full h-full object-cover" muted playsInline />
            ) : (
                <img src={previewUrl} alt={fileName} className="w-full h-full object-cover" />
            )}

            {/* Overlay dim while uploading */}
            {status === 'uploading' && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)' }} />
            )}

            {/* Done checkmark */}
            {status === 'done' && (
                <div style={{
                    position: 'absolute', top: 4, left: 4,
                    width: 18, height: 18, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.8)', fontSize: 10,
                }}>✓</div>
            )}

            {/* Error + retry */}
            {status === 'error' && (
                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)', gap: 4,
                }}>
                    <span style={{ color: '#f87171', fontSize: 10 }}>Failed</span>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            style={{ fontSize: 9, color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 3, padding: '2px 6px', cursor: 'pointer' }}
                        >retry</button>
                    )}
                </div>
            )}

            {/* Remove button */}
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

export default function CapsuleCreationForm() {
    const router = useRouter();
    const { showToast } = useToast();
    const { startPosting, updateProgress, finishPosting } = useCapsuleUpload();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themeColor, setThemeColor] = useState('#F5F5F5');
    const [themeColorHex, setThemeColorHex] = useState('#F5F5F5');
    const [fragranceNotes, setFragranceNotes] = useState<string[]>([]);
    const [includeCoverInMedia, setIncludeCoverInMedia] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tappedCover, setTappedCover] = useState(false);

    // Cover image single upload state
    const [coverUpload, setCoverUpload] = useState<SingleUpload | null>(null);

    // Audio single upload state
    const [audioUpload, setAudioUpload] = useState<SingleUpload | null>(null);

    // Media upload queue (images + videos)
    const { items: mediaItems, addFiles, removeFile, retryFile, clearAll, uploadingCount } = useMediaUploadQueue('capsule-media');

    // We need the user's ID for path prefixes — grab it once
    const userIdRef = useRef<string | null>(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => { userIdRef.current = data.user?.id ?? null; });
    }, []);

    const getUserId = () => userIdRef.current ?? 'anonymous';

    const isDirty = title.trim() !== '' || description.trim() !== '' || themeColor !== '#F5F5F5' || coverUpload !== null || audioUpload !== null || mediaItems.length > 0 || fragranceNotes.length > 0;
    useUnsavedChanges(isDirty && !isSubmitting);

    // ── Single file upload helper ────────────────────────────────────────────
    const uploadSingleFile = async (
        file: File,
        pathPrefix: string,
        contentType: string,
        setter: Dispatch<SetStateAction<SingleUpload | null>>
    ): Promise<string | null> => {
        const previewUrl = URL.createObjectURL(file);
        setter({ file, previewUrl, status: 'uploading', progress: 0, uploadedUrl: null });

        const fileExt = file.name.split('.').pop() ?? 'bin';
        const fileName = `${pathPrefix}/${crypto.randomUUID()}.${fileExt}`;

        try {
            const { data: signedData, error: signedError } = await supabase.storage
                .from('capsule-media').createSignedUploadUrl(fileName);
            if (signedError || !signedData) throw signedError ?? new Error('No signed URL');

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const pct = Math.round((e.loaded / e.total) * 100);
                        setter(prev => prev ? { ...prev, progress: pct } : prev);
                    }
                });
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

    // ── Handlers ──────────────────────────────────────────────────────────────
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
        const audioTypeMap: Record<string, string> = {
            mp3: 'audio/mpeg', mp4: 'audio/mp4', m4a: 'audio/mp4',
            wav: 'audio/wav', ogg: 'audio/ogg', webm: 'audio/webm', aac: 'audio/aac', flac: 'audio/flac',
        };
        const ct = audioTypeMap[ext] ?? 'audio/mpeg';
        uploadSingleFile(file, `${getUserId()}/audio`, ct, setAudioUpload);
        e.target.value = '';
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        const userId = getUserId();
        const pending = 30 - mediaItems.length;
        if (pending <= 0) { alert('Maximum 30 files allowed.'); return; }
        addFiles(files.slice(0, pending), `${userId}/media`);
        e.target.value = '';
    };

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setThemeColor(e.target.value); setThemeColorHex(e.target.value);
    };
    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setThemeColorHex(e.target.value);
        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) setThemeColor(e.target.value);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) { setError('Title is required'); return; }

        const pendingUploads = uploadingCount + (coverUpload?.status === 'uploading' ? 1 : 0) + (audioUpload?.status === 'uploading' ? 1 : 0);
        if (pendingUploads > 0) {
            setError('Please wait for all uploads to finish before submitting.');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        // Collect uploaded URLs
        const coverImageUrl = coverUpload?.uploadedUrl ?? undefined;
        const audioUrl = audioUpload?.uploadedUrl ?? undefined;
        const uploadedMedia = mediaItems
            .filter(i => i.status === 'done' && i.uploadedUrl)
            .map(i => ({
                url: i.uploadedUrl!,
                type: (i.file.type.startsWith('video') ? 'video' : 'image') as 'image' | 'video',
            }));

        // Navigate immediately ─ non-blocking
        router.push('/feed');

        // Background posting
        startPosting('Publishing capsule\u2026');

        createCapsuleRecord({
            title, description, themeColor,
            coverImageUrl, includeCoverInMedia,
            fragranceNotes,
            mediaItems: uploadedMedia,
            audioUrl,
        }).then(({ error: postError }) => {
            finishPosting();
            if (postError) {
                showToast('Failed to publish. Please check your capsules and try editing.');
            } else {
                showToast('Capsule added to the archive.');
            }
        });

        clearAll();
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium mb-1">Title (Required)</label>
                    <input
                        type="text" value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="archive-input" placeholder="ENTER CAPSULE TITLE"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4} className="archive-input min-h-[100px] resize-none"
                        placeholder="DESCRIBE THIS MEMORY..."
                    />
                </div>

                {/* Theme Color */}
                <div>
                    <label className="block text-sm font-medium mb-2">Theme Color</label>
                    <div className="flex gap-4 items-center">
                        <input type="color" value={themeColor} onChange={handleColorPickerChange} className="w-20 h-10 border rounded cursor-pointer" />
                        <input type="text" value={themeColorHex} onChange={handleHexInputChange} placeholder="#F5F5F5" className="archive-input flex-1" />
                    </div>
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-sm font-medium mb-1">Cover Image</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}>
                            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Choose cover image
                        <input type="file" accept="image/*" onChange={handleCoverChange} style={{ display: 'none' }} />
                    </label>

                    {coverUpload && (
                        <div onClick={() => setTappedCover(!tappedCover)} className="mt-2 relative inline-block" style={{ width: 120, height: 120 }}>
                            <img src={coverUpload.previewUrl} alt="Cover preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                            <ProgressBar pct={coverUpload.progress} done={coverUpload.status === 'done'} error={coverUpload.status === 'error'} />
                            {coverUpload.status === 'done' && (
                                <div style={{ position: 'absolute', top: 4, left: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 10 }}>✓</div>
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); setCoverUpload(null); }} className={`absolute top-0 right-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pt-1 pr-1 pb-2 pl-2 ${tappedCover ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'absolute', top: -8, right: -8, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, pointerEvents: 'none' }}>×</div>
                            </button>
                        </div>
                    )}

                    {coverUpload && (
                        <label className="flex items-center gap-2 mt-2">
                            <input type="checkbox" checked={includeCoverInMedia} onChange={(e) => setIncludeCoverInMedia(e.target.checked)} className="rounded" />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Also include this in capsule media</span>
                        </label>
                    )}
                </div>

                {/* Tags */}
                <TagInput label="Sensory Notes" tags={fragranceNotes} onChange={setFragranceNotes} max={20} placeholder="Type and press Enter (e.g. old books, rain, ozone)" />

                {/* Images & Videos */}
                <div>
                    <label className="block text-sm font-medium mb-2">Images &amp; Videos (Max 30)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}>
                            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Choose files
                        <input type="file" accept="image/*,video/*" multiple onChange={handleFileSelect} style={{ display: 'none' }} />
                    </label>

                    {mediaItems.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                            {mediaItems.map((item) => (
                                <UploadTile
                                    key={item.id}
                                    previewUrl={item.previewUrl}
                                    isVideo={item.file.type.startsWith('video')}
                                    progress={item.progress}
                                    status={item.status}
                                    fileName={item.file.name}
                                    onRemove={() => removeFile(item.id)}
                                    onRetry={() => retryFile(item.id, `${getUserId()}/media`)}
                                />
                            ))}
                        </div>
                    )}

                    <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        {mediaItems.length} file{mediaItems.length !== 1 ? 's' : ''}
                        {uploadingCount > 0 ? ` · uploading ${uploadingCount}…` : ''}
                    </p>
                </div>

                {/* Audio */}
                <div>
                    <label className="block text-sm font-medium mb-1">Ambient Audio (Optional)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px dashed var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', width: 'fit-content' }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}>
                            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                        </svg>
                        Choose audio
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

                {/* Error */}
                {error && (
                    <div className="p-3 text-sm rounded" style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {error}
                    </div>
                )}

                <button type="submit" className="archive-btn">
                    CREATE CAPSULE
                </button>
            </form>
        </>
    );
}
