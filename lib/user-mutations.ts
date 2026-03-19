import { supabase } from './supabase';

const MAX_PFP_BYTES = 2 * 1024 * 1024; // 2 MB
const MAX_BANNER_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Update user profile (username, pfp, banner) ───────────────────────────
export async function updateUserProfile({
    username,
    profileImageFile,
    bannerImageFile,
}: {
    username?: string;
    profileImageFile?: File;
    bannerImageFile?: File;
}) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return { error: new Error('Not authenticated') };

    // Validate file sizes
    if (profileImageFile && profileImageFile.size > MAX_PFP_BYTES) {
        return { error: new Error('Profile picture must be under 2 MB') };
    }
    if (bannerImageFile && bannerImageFile.size > MAX_BANNER_BYTES) {
        return { error: new Error('Banner must be under 5 MB') };
    }

    const updates: Record<string, string> = {};

    // Username
    if (username !== undefined) {
        const clean = username.toLowerCase().trim();
        if (!/^[a-z0-9_]{3,20}$/.test(clean)) {
            return { error: new Error('Username must be 3–20 characters, lowercase letters, numbers, underscores only') };
        }

        // Check availability via RPC
        const { data: available } = await supabase.rpc('is_username_available', { uname: clean });
        if (!available) return { error: new Error('Username is already taken') };

        updates.username = clean;
    }

    // Profile picture
    if (profileImageFile) {
        const ext = profileImageFile.name.split('.').pop();
        const path = `avatars/${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
            .from('capsule-media')
            .upload(path, profileImageFile, { upsert: true });

        if (uploadErr) return { error: uploadErr };

        const { data: { publicUrl } } = supabase.storage.from('capsule-media').getPublicUrl(path);
        updates.profile_image_url = publicUrl;
    }

    // Banner
    if (bannerImageFile) {
        const ext = bannerImageFile.name.split('.').pop();
        const path = `banners/${userId}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
            .from('capsule-media')
            .upload(path, bannerImageFile, { upsert: true });

        if (uploadErr) return { error: uploadErr };

        const { data: { publicUrl } } = supabase.storage.from('capsule-media').getPublicUrl(path);
        updates.banner_image_url = publicUrl;
    }

    if (Object.keys(updates).length === 0) return { error: null };

    const { error } = await supabase
        .from('users')
        .upsert(
            { id: userId, ...updates },
            { onConflict: 'id' }
        );

    return { error: error ?? null };
}

// ── Save a capsule ─────────────────────────────────────────────────────────
export async function saveCapsule(capsuleId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
        .from('saved_capsules')
        .insert({ user_id: userId, capsule_id: capsuleId });

    return { error: error ?? null };
}

// ── Unsave a capsule ───────────────────────────────────────────────────────
export async function unsaveCapsule(capsuleId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return { error: new Error('Not authenticated') };

    const { error } = await supabase
        .from('saved_capsules')
        .delete()
        .eq('user_id', userId)
        .eq('capsule_id', capsuleId);

    return { error: error ?? null };
}

// ── Check if capsule is saved ──────────────────────────────────────────────
export async function isCapsuleSaved(capsuleId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return false;

    const { data } = await supabase
        .from('saved_capsules')
        .select('id')
        .eq('user_id', userId)
        .eq('capsule_id', capsuleId)
        .single();

    return !!data;
}

// ── Get saved capsules (for MyJourney) ────────────────────────────────────
export async function getSavedCapsules() {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return { capsules: [], error: null };

    const { data, error } = await supabase
        .from('saved_capsules')
        .select(`
            capsule_id,
            created_at,
            capsules (
                id,
                title,
                theme_color,
                cover_image_url,
                status,
                visibility,
                created_at
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) return { capsules: [], error };

    // Flatten to capsule objects
    const capsules = (data || [])
        .map((row: any) => row.capsules)
        .filter((c: any) => c && c.status === 'active');

    return { capsules, error: null };
}
