
import { supabase } from './supabase';

// Browser sometimes misreports .mp3 as video/mpeg — always use the correct type
function getAudioContentType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
        mp3: 'audio/mpeg',
        mp4: 'audio/mp4',
        m4a: 'audio/mp4',
        wav: 'audio/wav',
        ogg: 'audio/ogg',
        oga: 'audio/ogg',
        webm: 'audio/webm',
        aac: 'audio/aac',
        flac: 'audio/flac',
    };
    return map[ext ?? ''] ?? 'audio/mpeg';
}

export interface CreateCapsuleParams {
    title: string;
    description?: string;
    shortDescription?: string;
    themeColor?: string;
    coverImage?: File;
    includeCoverInMedia?: boolean;
    hashtags?: string[];
    fragranceNotes: string[];
    mediaFiles: File[];
    audioFile?: File;
}

export async function createCapsule(params: CreateCapsuleParams) {
    const { title, description, shortDescription, themeColor, coverImage, includeCoverInMedia, hashtags, fragranceNotes, mediaFiles, audioFile } = params;

    // 1. Get User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: authError || new Error('User not authenticated') };
    }

    const userId = user.id;
    let coverImageUrl: string | null = null;

    try {
        // 2. Upload cover image if provided
        if (coverImage) {
            const fileExt = coverImage.name.split('.').pop();
            const fileName = `${userId}/covers/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('capsule-media')
                .upload(fileName, coverImage);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('capsule-media')
                .getPublicUrl(fileName);

            coverImageUrl = publicUrl;
        }

        // 3. Insert Capsule with new fields
        const { data: capsule, error: capsuleError } = await supabase
            .from('capsules')
            .insert({
                creator_id: userId,
                title,
                description,
                short_description: shortDescription,
                theme_color: themeColor || '#F5F5F5',
                cover_image_url: coverImageUrl,
                status: 'active',
                visibility: 'public'
            })
            .select()
            .single();

        if (capsuleError) {
            console.error('Error creating capsule:', capsuleError);
            return { error: capsuleError };
        }

        const capsuleId = capsule.id;

        // 4. Upload Media & Insert Records
        const mediaPromises = mediaFiles.map(async (file, index) => {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${capsuleId}/${crypto.randomUUID()}.${fileExt}`;
            const filePath = `${fileName}`;

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('capsule-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('capsule-media')
                .getPublicUrl(filePath);

            // Determine type
            const mediaType = file.type.startsWith('video') ? 'video' : 'image';

            // Insert Record
            return supabase
                .from('capsule_media')
                .insert({
                    capsule_id: capsuleId,
                    media_type: mediaType,
                    file_url: publicUrl,
                    order_index: index
                });
        });

        await Promise.all(mediaPromises);

        // 5. Insert hashtags if provided
        if (hashtags && hashtags.length > 0) {
            const hashtagsData = hashtags.slice(0, 4).map((tag, index) => ({
                capsule_id: capsuleId,
                hashtag: tag.toLowerCase().replace(/^#/, ''),
                order_index: index + 1
            }));

            const { error: hashtagsError } = await supabase
                .from('capsule_hashtags')
                .insert(hashtagsData);

            if (hashtagsError) throw hashtagsError;
        }

        // 6. Add cover image to media if checkbox was checked
        if (coverImageUrl && includeCoverInMedia) {
            await supabase
                .from('capsule_media')
                .insert({
                    capsule_id: capsuleId,
                    media_type: 'image',
                    file_url: coverImageUrl,
                    order_index: mediaFiles.length
                });
        }

        // 7. Upload Audio & Insert Record
        if (audioFile) {
            const fileExt = audioFile.name.split('.').pop();
            const fileName = `${userId}/${capsuleId}/audio-${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('capsule-media')
                .upload(fileName, audioFile, { contentType: getAudioContentType(audioFile.name) });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('capsule-media')
                .getPublicUrl(fileName);

            await supabase
                .from('capsule_audio')
                .insert({
                    capsule_id: capsuleId,
                    file_url: publicUrl
                });
        }

        // 8. Insert Fragrance Notes
        if (fragranceNotes.length > 0) {
            const notesData = fragranceNotes.map((note, index) => ({
                capsule_id: capsuleId,
                note_text: note,
                order_index: index
            }));

            const { error: notesError } = await supabase
                .from('capsule_notes')
                .insert(notesData);

            if (notesError) throw notesError;
        }

        return { capsule, error: null };

    } catch (error) {
        console.error('Error in capsule creation flow:', error);
        return { capsule: null, error };
    }
}

export async function softDeleteCapsule(capsuleId: string) {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { error: new Error('User not authenticated') };
    }

    // Perform soft delete
    const { error } = await supabase
        .from('capsules')
        .update({ status: 'removed' })
        .eq('id', capsuleId)
        .eq('creator_id', user.id); // Ensure user owns the capsule

    if (error) {
        console.error('Soft delete error:', error);
    }

    return { error };
}

export interface UpdateCapsuleParams {
    capsuleId: string;
    title: string;
    description?: string;
    shortDescription?: string;
    themeColor?: string;
    coverImage?: File;
    hashtags?: string[];
    fragranceNotes: string[];
    mediaIdsToRemove?: string[];
    newMediaFiles?: File[];
    audioIdsToRemove?: string[];
    audioFile?: File;
}

export async function updateCapsule(params: UpdateCapsuleParams) {
    const { capsuleId, title, description, shortDescription, themeColor, coverImage, hashtags, fragranceNotes, mediaIdsToRemove, newMediaFiles, audioIdsToRemove, audioFile } = params;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error('Not authenticated') };

    try {
        let coverImageUrl: string | undefined;

        // 1. Upload new cover image if provided
        if (coverImage) {
            const fileExt = coverImage.name.split('.').pop();
            const fileName = `${user.id}/covers/${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('capsule-media')
                .upload(fileName, coverImage);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('capsule-media')
                .getPublicUrl(fileName);

            coverImageUrl = publicUrl;
        }

        // 2. Update Capsule
        const updateData: any = { title, description };
        if (shortDescription !== undefined) updateData.short_description = shortDescription;
        if (themeColor !== undefined) updateData.theme_color = themeColor;
        if (coverImageUrl) updateData.cover_image_url = coverImageUrl;

        const { error: capsuleError } = await supabase
            .from('capsules')
            .update(updateData)
            .eq('id', capsuleId)
            .eq('creator_id', user.id);

        if (capsuleError) return { error: capsuleError };

        // 3. Update Hashtags (Delete all, then re-insert)
        const { error: deleteHashtagsError } = await supabase
            .from('capsule_hashtags')
            .delete()
            .eq('capsule_id', capsuleId);

        if (deleteHashtagsError) throw deleteHashtagsError;

        if (hashtags && hashtags.length > 0) {
            const hashtagsData = hashtags.slice(0, 4).map((tag, index) => ({
                capsule_id: capsuleId,
                hashtag: tag.toLowerCase().replace(/^#/, ''),
                order_index: index + 1
            }));

            const { error: hashtagsError } = await supabase
                .from('capsule_hashtags')
                .insert(hashtagsData);

            if (hashtagsError) throw hashtagsError;
        }

        // 4. Remove media if specified
        if (mediaIdsToRemove && mediaIdsToRemove.length > 0) {
            const { error: deleteMediaError } = await supabase
                .from('capsule_media')
                .delete()
                .in('id', mediaIdsToRemove);

            if (deleteMediaError) throw deleteMediaError;
        }

        // 5. Remove audio if specified
        if (audioIdsToRemove && audioIdsToRemove.length > 0) {
            const { error: deleteAudioError } = await supabase
                .from('capsule_audio')
                .delete()
                .in('id', audioIdsToRemove);

            if (deleteAudioError) throw deleteAudioError;
        }

        // 5b. Upload new audio if provided
        if (audioFile) {
            const { data: { user } } = await supabase.auth.getUser();
            const fileExt = audioFile.name.split('.').pop();
            const fileName = `${user!.id}/${capsuleId}/audio-${crypto.randomUUID()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('capsule-media')
                .upload(fileName, audioFile, { contentType: getAudioContentType(audioFile.name) });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('capsule-media')
                .getPublicUrl(fileName);

            const { error: insertAudioError } = await supabase
                .from('capsule_audio')
                .insert({ capsule_id: capsuleId, file_url: publicUrl });

            if (insertAudioError) throw insertAudioError;
        }

        // 5c. Upload new media images if provided
        if (newMediaFiles && newMediaFiles.length > 0) {
            // Get current max order_index to append after existing media
            const { data: existingMedia } = await supabase
                .from('capsule_media')
                .select('order_index')
                .eq('capsule_id', capsuleId)
                .order('order_index', { ascending: false })
                .limit(1);

            const startIndex = existingMedia && existingMedia.length > 0
                ? (existingMedia[0].order_index + 1)
                : 0;

            const mediaUploadPromises = newMediaFiles.map(async (file, index) => {
                const fileExt = file.name.split('.').pop();
                const fileName = `${user.id}/${capsuleId}/${crypto.randomUUID()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('capsule-media')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('capsule-media')
                    .getPublicUrl(fileName);

                const mediaType = file.type.startsWith('video') ? 'video' : 'image';

                return supabase
                    .from('capsule_media')
                    .insert({
                        capsule_id: capsuleId,
                        media_type: mediaType,
                        file_url: publicUrl,
                        order_index: startIndex + index,
                    });
            });

            await Promise.all(mediaUploadPromises);
        }

        // 6. Update Notes (Delete all for this capsule, then re-insert)
        const { error: deleteNotesError } = await supabase
            .from('capsule_notes')
            .delete()
            .eq('capsule_id', capsuleId);

        if (deleteNotesError) return { error: deleteNotesError };

        if (fragranceNotes.length > 0) {
            const notesData = fragranceNotes.map((note, index) => ({
                capsule_id: capsuleId,
                note_text: note,
                order_index: index
            }));

            const { error: insertNotesError } = await supabase
                .from('capsule_notes')
                .insert(notesData);

            if (insertNotesError) return { error: insertNotesError };
        }

        return { error: null };

    } catch (error: any) {
        const msg = error?.message || error?.error_description || JSON.stringify(error, Object.getOwnPropertyNames(error)) || 'Unknown error';
        console.error('Error updating capsule:', msg, error);
        return { error: new Error(msg) };
    }
}

export interface CreateCapsuleRecordParams {
    title: string;
    description?: string;
    themeColor?: string;
    coverImageUrl?: string;
    includeCoverInMedia?: boolean;
    hashtags?: string[];
    fragranceNotes: string[];
    mediaItems: { url: string; type: 'image' | 'video' }[];
    audioUrl?: string;
}

/**
 * Creates a complete capsule record (DB only) using already-uploaded URLs.
 * Called from the background posting flow after all files are uploaded.
 */
export async function createCapsuleRecord(params: CreateCapsuleRecordParams) {
    const { title, description, themeColor, coverImageUrl, includeCoverInMedia, hashtags, fragranceNotes, mediaItems, audioUrl } = params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { capsule: null, error: authError || new Error('Not authenticated') };

    try {
        const { data: capsule, error: capsuleError } = await supabase
            .from('capsules')
            .insert({
                creator_id: user.id,
                title,
                description,
                theme_color: themeColor || '#F5F5F5',
                cover_image_url: coverImageUrl ?? null,
                status: 'active',
                visibility: 'public',
            })
            .select()
            .single();

        if (capsuleError || !capsule) return { capsule: null, error: capsuleError };

        const capsuleId = capsule.id;

        const allMediaItems = [...mediaItems];
        if (coverImageUrl && includeCoverInMedia) {
            allMediaItems.push({ url: coverImageUrl, type: 'image' });
        }

        if (allMediaItems.length > 0) {
            await supabase.from('capsule_media').insert(
                allMediaItems.map((m, i) => ({
                    capsule_id: capsuleId,
                    media_type: m.type,
                    file_url: m.url,
                    order_index: i,
                }))
            );
        }

        if (hashtags && hashtags.length > 0) {
            await supabase.from('capsule_hashtags').insert(
                hashtags.slice(0, 4).map((tag, i) => ({
                    capsule_id: capsuleId,
                    hashtag: tag.toLowerCase().replace(/^#/, ''),
                    order_index: i + 1,
                }))
            );
        }

        if (audioUrl) {
            await supabase.from('capsule_audio').insert({ capsule_id: capsuleId, file_url: audioUrl });
        }

        if (fragranceNotes.length > 0) {
            await supabase.from('capsule_notes').insert(
                fragranceNotes.map((note, i) => ({ capsule_id: capsuleId, note_text: note, order_index: i }))
            );
        }

        return { capsule, error: null };
    } catch (err: any) {
        console.error('createCapsuleRecord error:', err);
        return { capsule: null, error: err };
    }
}

/**
 * Attaches pre-uploaded media/audio to an existing capsule (edit background flow).
 */
export async function attachMediaToCapsule(
    capsuleId: string,
    mediaItems: { url: string; type: 'image' | 'video' }[],
    audioUrl?: string,
    audioIdsToRemove?: string[],
    mediaIdsToRemove?: string[]
) {
    try {
        if (mediaIdsToRemove && mediaIdsToRemove.length > 0)
            await supabase.from('capsule_media').delete().in('id', mediaIdsToRemove);

        if (audioIdsToRemove && audioIdsToRemove.length > 0)
            await supabase.from('capsule_audio').delete().in('id', audioIdsToRemove);

        if (mediaItems.length > 0) {
            const { data: existing } = await supabase
                .from('capsule_media').select('order_index')
                .eq('capsule_id', capsuleId)
                .order('order_index', { ascending: false }).limit(1);
            const startIndex = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

            await supabase.from('capsule_media').insert(
                mediaItems.map((m, i) => ({
                    capsule_id: capsuleId, media_type: m.type, file_url: m.url, order_index: startIndex + i,
                }))
            );
        }

        if (audioUrl)
            await supabase.from('capsule_audio').insert({ capsule_id: capsuleId, file_url: audioUrl });

        return { error: null };
    } catch (err: any) {
        return { error: err };
    }
}
