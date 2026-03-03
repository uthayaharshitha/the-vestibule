'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCapsule } from '@/lib/capsule-mutations';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/contexts/ToastContext';
import TagInput from '@/components/TagInput';

interface CapsuleEditFormProps {
    capsuleId: string;
}

export default function CapsuleEditForm({ capsuleId }: CapsuleEditFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themeColor, setThemeColor] = useState('#F5F5F5');
    const [themeColorHex, setThemeColorHex] = useState('#F5F5F5');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [existingCoverUrl, setExistingCoverUrl] = useState<string | null>(null);
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [fragranceNotes, setFragranceNotes] = useState<string[]>([]);
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [existingAudio, setExistingAudio] = useState<any[]>([]);
    const [mediaToRemove, setMediaToRemove] = useState<string[]>([]);
    const [newMediaFiles, setNewMediaFiles] = useState<File[]>([]);
    const [audioToRemove, setAudioToRemove] = useState<string[]>([]);
    const [newAudioFile, setNewAudioFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            // Fetch capsule details
            const { data: capsule, error: capsuleError } = await supabase
                .from('capsules')
                .select('title, description, theme_color, cover_image_url')
                .eq('id', capsuleId)
                .single();

            if (capsuleError) {
                setError('Failed to load capsule.');
                setLoading(false);
                return;
            }

            // Fetch notes
            const { data: notes } = await supabase
                .from('capsule_notes')
                .select('note_text')
                .eq('capsule_id', capsuleId)
                .order('order_index');

            // Fetch hashtags
            const { data: hashtagsData } = await supabase
                .from('capsule_hashtags')
                .select('hashtag')
                .eq('capsule_id', capsuleId)
                .order('order_index');

            // Fetch media
            const { data: media } = await supabase
                .from('capsule_media')
                .select('*')
                .eq('capsule_id', capsuleId)
                .order('order_index');

            // Fetch audio
            const { data: audio } = await supabase
                .from('capsule_audio')
                .select('*')
                .eq('capsule_id', capsuleId);

            if (capsule) {
                setTitle(capsule.title);
                setDescription(capsule.description || '');
                const color = capsule.theme_color || '#F5F5F5';
                setThemeColor(color);
                setThemeColorHex(color);
                setExistingCoverUrl(capsule.cover_image_url);
            }

            if (notes && notes.length > 0) {
                setFragranceNotes(notes.map(n => n.note_text));
            }

            if (hashtagsData && hashtagsData.length > 0) {
                setHashtags(hashtagsData.map(h => h.hashtag));
            }

            if (media) {
                setExistingMedia(media);
            }

            if (audio) {
                setExistingAudio(audio);
            }

            setLoading(false);
        };

        fetchData();
    }, [capsuleId]);

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCoverImage(file);
            setCoverImagePreview(URL.createObjectURL(file));
        }
    };

    const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const color = e.target.value;
        setThemeColor(color);
        setThemeColorHex(color);
    };

    const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const hex = e.target.value;
        setThemeColorHex(hex);
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            setThemeColor(hex);
        }
    };

    const handleRemoveMedia = (mediaId: string) => {
        setMediaToRemove([...mediaToRemove, mediaId]);
        setExistingMedia(existingMedia.filter(m => m.id !== mediaId));
    };

    const handleRemoveAudio = (audioId: string) => {
        setAudioToRemove([...audioToRemove, audioId]);
        setExistingAudio(existingAudio.filter(a => a.id !== audioId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { error: updateError } = await updateCapsule({
            capsuleId,
            title,
            description,
            themeColor,
            coverImage: coverImage || undefined,
            hashtags,
            fragranceNotes,
            mediaIdsToRemove: mediaToRemove.length > 0 ? mediaToRemove : undefined,
            newMediaFiles: newMediaFiles.length > 0 ? newMediaFiles : undefined,
            audioIdsToRemove: audioToRemove.length > 0 ? audioToRemove : undefined,
            audioFile: newAudioFile || undefined,
        });

        if (updateError) {
            console.error(updateError);
            setError('Failed to update capsule.');
            setIsSubmitting(false);
            return;
        }

        showToast('Capsule updated quietly.');
        router.push(`/capsule/${capsuleId}`);
        router.refresh();
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>[ Loading capsule data... ]</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-main)' }}>Edit Capsule</h2>

            {/* Title */}
            <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Title (Required)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="archive-input"
                    placeholder="ENTER CAPSULE TITLE"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="archive-input min-h-[100px] resize-none"
                    placeholder="DESCRIBE THIS MEMORY..."
                />
            </div>

            {/* Theme Color */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Theme Color</label>
                <div className="flex gap-4 items-center">
                    <div>
                        <input
                            type="color"
                            value={themeColor}
                            onChange={handleColorPickerChange}
                            className="w-20 h-10 border rounded cursor-pointer"
                            style={{ borderColor: 'var(--border-color)' }}
                        />
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={themeColorHex}
                            onChange={handleHexInputChange}
                            placeholder="#F5F5F5"
                            className="archive-input"
                        />
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            <div>
                <label className="block text-sm font-medium mb-1">Cover Image</label>
                {existingCoverUrl && !coverImagePreview && (
                    <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Current cover:</p>
                        <img src={existingCoverUrl} alt="Current cover" className="w-48 h-48 object-cover rounded-lg border" />
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100 mb-2"
                />
                {coverImagePreview && (
                    <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">New cover preview:</p>
                        <img src={coverImagePreview} alt="Cover preview" className="w-48 h-48 object-cover rounded-lg border" />
                    </div>
                )}
            </div>

            {/* Hashtags */}
            <TagInput
                label="Hashtags"
                tags={hashtags}
                onChange={setHashtags}
                max={4}
                placeholder="Type and press Enter (no # needed)"
                prefix="#"
            />

            {/* Sensory Notes */}
            <TagInput
                label="Sensory Notes"
                tags={fragranceNotes}
                onChange={setFragranceNotes}
                max={20}
                placeholder="Type and press Enter (e.g. old books, rain, ozone)"
            />

            {/* Existing Media */}
            {existingMedia.length > 0 && (
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Existing Media (Click × to remove)</label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {existingMedia.map((media) => (
                            <div key={media.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                {media.media_type === 'image' ? (
                                    <img src={media.file_url} alt="Media" className="w-full h-full object-cover" />
                                ) : (
                                    <video src={media.file_url} className="w-full h-full object-cover" muted />
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMedia(media.id)}
                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Media Images */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
                    Add Images / Videos
                </label>

                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        border: '1px dashed var(--border-color)',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        width: 'fit-content',
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" style={{ opacity: 0.6 }}>
                        <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                    Choose files
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            if (e.target.files) {
                                const picked = Array.from(e.target.files);
                                setNewMediaFiles((prev) => [...prev, ...picked]);
                                // Reset input so the same file can be re-added if needed
                                e.target.value = '';
                            }
                        }}
                    />
                </label>

                {/* Preview grid of newly selected files */}
                {newMediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                        {newMediaFiles.map((file, idx) => {
                            const previewUrl = URL.createObjectURL(file);
                            const isVideo = file.type.startsWith('video');
                            return (
                                <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                    {isVideo ? (
                                        <video src={previewUrl} className="w-full h-full object-cover" muted />
                                    ) : (
                                        <img src={previewUrl} alt={file.name} className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setNewMediaFiles((prev) => prev.filter((_, i) => i !== idx))}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            right: 0,
                                            background: 'rgba(0,0,0,0.4)',
                                            color: '#fff',
                                            fontSize: '0.65rem',
                                            padding: '2px 4px',
                                            overflow: 'hidden',
                                            whiteSpace: 'nowrap',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        {file.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Ambient Audio */}
            <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>Ambient Audio</label>

                {/* Existing audio: preview + replace + remove */}
                {existingAudio.length > 0 && existingAudio.map((audio) => (
                    <div key={audio.id} className="flex items-center gap-3 mb-3 p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                        <audio src={audio.file_url} controls className="flex-1 h-8" style={{ minWidth: 0 }} />
                        <button
                            type="button"
                            onClick={() => handleRemoveAudio(audio.id)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: 'rgba(220,38,38,0.1)', color: '#dc2626' }}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                {/* Upload input: always visible — replaces if audio exists, adds if none */}
                <div className="mt-1">
                    <label className="block text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {existingAudio.length > 0 ? 'Replace with new audio:' : 'Add ambient audio:'}
                    </label>
                    <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setNewAudioFile(e.target.files[0]);
                                // Auto-queue existing audio for removal on replace
                                if (existingAudio.length > 0) {
                                    setAudioToRemove(existingAudio.map(a => a.id));
                                    setExistingAudio([]);
                                }
                            }
                        }}
                        className="block w-full text-sm
                            file:mr-4 file:py-1 file:px-3
                            file:rounded-md file:border-0
                            file:text-sm file:font-medium
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                        style={{ color: 'var(--text-secondary)' }}
                    />
                    {newAudioFile && (
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                            Selected: {newAudioFile.name}
                        </p>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="archive-btn opacity-60 hover:opacity-100"
                >
                    CANCEL
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="archive-btn"
                >
                    {isSubmitting ? 'SAVING...' : 'SAVE CHANGES'}
                </button>
            </div>
        </form>
    );
}
