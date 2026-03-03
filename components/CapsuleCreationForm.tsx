'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCapsule } from '@/lib/capsule-mutations';
import { useToast } from '@/contexts/ToastContext';
import TagInput from '@/components/TagInput';

export default function CapsuleCreationForm() {
    const router = useRouter();
    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [themeColor, setThemeColor] = useState('#F5F5F5');
    const [themeColorHex, setThemeColorHex] = useState('#F5F5F5');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
    const [includeCoverInMedia, setIncludeCoverInMedia] = useState(false);
    const [hashtags, setHashtags] = useState<string[]>([]);
    const [fragranceNotes, setFragranceNotes] = useState<string[]>([]);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const selectedFiles = Array.from(e.target.files);

        setMediaFiles(prev => {
            const combined = [...prev, ...selectedFiles];
            if (combined.length > 30) {
                alert('Maximum 30 files allowed per capsule.');
            }
            return combined.slice(0, 30);
        });

        e.target.value = '';
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const { capsule, error: submitError } = await createCapsule({
            title,
            description,
            themeColor,
            coverImage: coverImage || undefined,
            includeCoverInMedia,
            hashtags,
            fragranceNotes,
            mediaFiles,
            audioFile: audioFile || undefined
        });

        if (submitError) {
            console.error(submitError);
            setError('Failed to create capsule. Please try again.');
            setIsSubmitting(false);
            return;
        }

        if (capsule) {
            setMediaFiles([]);
            showToast('Capsule added to the archive.');
            router.push(`/capsule/${capsule.id}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">

            <div>
                <label className="block text-sm font-medium mb-1">Title (Required)</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="archive-input"
                    placeholder="ENTER CAPSULE TITLE"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="archive-input min-h-[100px] resize-none"
                    placeholder="DESCRIBE THIS MEMORY..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Theme Color</label>
                <div className="flex gap-4 items-center">
                    <div>
                        <input
                            type="color"
                            value={themeColor}
                            onChange={handleColorPickerChange}
                            className="w-20 h-10 border rounded cursor-pointer"
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

            <div>
                <label className="block text-sm font-medium mb-1">Cover Image</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageChange}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100 mb-2"
                />
                {coverImagePreview && (
                    <div className="mt-2">
                        <img
                            src={coverImagePreview}
                            alt="Cover preview"
                            className="w-48 h-48 object-cover rounded-lg border"
                        />
                    </div>
                )}
                <label className="flex items-center gap-2 mt-2">
                    <input
                        type="checkbox"
                        checked={includeCoverInMedia}
                        onChange={(e) => setIncludeCoverInMedia(e.target.checked)}
                        className="rounded"
                    />
                    <span className="text-sm text-gray-600">Also include this in capsule media</span>
                </label>
            </div>

            <TagInput
                label="Hashtags"
                tags={hashtags}
                onChange={setHashtags}
                max={4}
                placeholder="Type and press Enter (no # needed)"
                prefix="#"
            />

            <TagInput
                label="Sensory Notes"
                tags={fragranceNotes}
                onChange={setFragranceNotes}
                max={20}
                placeholder="Type and press Enter (e.g. old books, rain, ozone)"
            />

            <div>
                <label className="block text-sm font-medium mb-1">Images & Videos (Max 30)</label>
                <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100 mb-4"
                />

                {mediaFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                        {mediaFiles.map((file, index) => {
                            const previewUrl = URL.createObjectURL(file);
                            return (
                                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                                    {file.type.startsWith('image') ? (
                                        <img
                                            src={previewUrl}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <video
                                            src={previewUrl}
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setMediaFiles(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-1 right-1 bg-black text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                <p className="text-xs text-gray-500">
                    {mediaFiles.length} file{mediaFiles.length !== 1 ? 's' : ''} selected
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Ambient Audio (Optional)</label>
                <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-violet-50 file:text-violet-700
                        hover:file:bg-violet-100"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting}
                className="archive-btn"
            >
                {isSubmitting ? 'CREATING CAPSULE...' : 'CREATE CAPSULE'}
            </button>
        </form>
    );
}
