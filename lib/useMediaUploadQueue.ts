'use client';

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export interface UploadItem {
    id: string;
    file: File;
    previewUrl: string;
    status: UploadStatus;
    progress: number;  // 0-100
    uploadedUrl: string | null;
    retries: number;
    mediaType: 'image' | 'video' | 'audio' | 'cover';
    error?: string;
}

const MAX_RETRIES = 2;

function getAudioContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        mp3: 'audio/mpeg', mp4: 'audio/mp4', m4a: 'audio/mp4',
        wav: 'audio/wav', ogg: 'audio/ogg', oga: 'audio/ogg',
        webm: 'audio/webm', aac: 'audio/aac', flac: 'audio/flac',
    };
    return map[ext ?? ''] ?? 'audio/mpeg';
}

async function uploadWithXHR(
    signedUrl: string,
    file: File,
    contentType: string,
    onProgress: (pct: number) => void,
    abortSignal?: AbortSignal
): Promise<void> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        abortSignal?.addEventListener('abort', () => {
            xhr.abort();
            reject(new Error('Upload aborted'));
        });

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                onProgress(Math.round((e.loaded / e.total) * 100));
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
            }
        });

        xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
        xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));

        xhr.open('PUT', signedUrl);
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.send(file);
    });
}

export function useMediaUploadQueue(bucket = 'capsule-media') {
    const [items, setItems] = useState<UploadItem[]>([]);
    const abortControllers = useRef<Map<string, AbortController>>(new Map());

    const updateItem = useCallback((id: string, patch: Partial<UploadItem>) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
    }, []);

    const uploadItem = useCallback(async (item: UploadItem, pathPrefix: string) => {
        const controller = new AbortController();
        abortControllers.current.set(item.id, controller);

        updateItem(item.id, { status: 'uploading', progress: 0 });

        const fileExt = item.file.name.split('.').pop() ?? 'bin';
        const fileName = `${pathPrefix}/${crypto.randomUUID()}.${fileExt}`;
        const contentType = item.mediaType === 'audio'
            ? getAudioContentType(item.file.name)
            : item.file.type || 'application/octet-stream';

        try {
            // Get a signed upload URL from Supabase
            const { data: signedData, error: signedError } = await supabase.storage
                .from(bucket)
                .createSignedUploadUrl(fileName);

            if (signedError || !signedData) throw signedError ?? new Error('No signed URL');

            await uploadWithXHR(
                signedData.signedUrl,
                item.file,
                contentType,
                (pct) => updateItem(item.id, { progress: pct }),
                controller.signal
            );

            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);

            updateItem(item.id, { status: 'done', progress: 100, uploadedUrl: publicUrl });
        } catch (err: any) {
            if (err?.message === 'Upload aborted') return; // intentional removal

            const currentRetries = item.retries;
            if (currentRetries < MAX_RETRIES) {
                // retry
                setItems(prev => prev.map(i => i.id === item.id ? { ...i, retries: i.retries + 1 } : i));
                setTimeout(() => uploadItem({ ...item, retries: currentRetries + 1 }, pathPrefix), 1500);
            } else {
                updateItem(item.id, { status: 'error', error: err?.message ?? 'Upload failed' });
            }
        } finally {
            abortControllers.current.delete(item.id);
        }
    }, [bucket, updateItem]);

    const addFiles = useCallback((files: File[], pathPrefix: string, mediaType: UploadItem['mediaType'] = 'image') => {
        const newItems: UploadItem[] = files.map(file => ({
            id: crypto.randomUUID(),
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'pending' as UploadStatus,
            progress: 0,
            uploadedUrl: null,
            retries: 0,
            mediaType,
        }));

        setItems(prev => {
            const combined = [...prev, ...newItems];
            return combined.slice(0, 30);
        });

        newItems.forEach(item => uploadItem(item, pathPrefix));
        return newItems;
    }, [uploadItem]);

    const removeFile = useCallback((id: string) => {
        const controller = abortControllers.current.get(id);
        controller?.abort();
        abortControllers.current.delete(id);

        setItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
            return prev.filter(i => i.id !== id);
        });
    }, []);

    const retryFile = useCallback((id: string, pathPrefix: string) => {
        const item = items.find(i => i.id === id);
        if (item) {
            updateItem(id, { retries: 0, status: 'pending' });
            uploadItem({ ...item, retries: 0 }, pathPrefix);
        }
    }, [items, updateItem, uploadItem]);

    const clearAll = useCallback(() => {
        abortControllers.current.forEach(c => c.abort());
        abortControllers.current.clear();
        setItems(prev => {
            prev.forEach(item => URL.revokeObjectURL(item.previewUrl));
            return [];
        });
    }, []);

    const getUploadedUrls = useCallback(() =>
        items.filter(i => i.status === 'done' && i.uploadedUrl).map(i => ({
            url: i.uploadedUrl!,
            mediaType: i.mediaType,
            file: i.file,
        })),
    [items]);

    const allUploaded = items.length === 0 || items.every(i => i.status === 'done' || i.status === 'error');
    const hasErrors = items.some(i => i.status === 'error');
    const uploadingCount = items.filter(i => i.status === 'uploading' || i.status === 'pending').length;

    return { items, addFiles, removeFile, retryFile, clearAll, getUploadedUrls, allUploaded, hasErrors, uploadingCount };
}
