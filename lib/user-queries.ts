import { supabase } from './supabase';

export interface UserProfile {
    id: string;
    username: string | null;
    pseudonym: string | null;
    profile_image_url: string | null;
    banner_image_url: string | null;
    created_at: string;
    role: string;
}

// ── Get current user's full profile ──────────────────────────────────────
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
        .from('users')
        .select('id, username, pseudonym, profile_image_url, banner_image_url, created_at, role')
        .eq('id', userId)
        .single();

    if (error || !data) return null;
    return data as UserProfile;
}

// ── Get any user's public profile by username ──────────────────────────────
export async function getUserByUsername(username: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('users')
        .select('id, username, pseudonym, profile_image_url, banner_image_url, created_at, role')
        .eq('username', username.toLowerCase())
        .single();

    if (error || !data) return null;
    return data as UserProfile;
}

// ── Get capsules created by a user ────────────────────────────────────────
export async function getCapsulesByUserId(userId: string) {
    const { data, error } = await supabase
        .from('capsules')
        .select(`
            *,
            capsule_hashtags (hashtag, order_index),
            capsule_media (file_url, media_type, order_index)
        `)
        .eq('creator_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) return { capsules: [], error };
    return { capsules: data, error: null };
}

// ── Check username availability (via SECURITY DEFINER RPC) ────────────────
export async function checkUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_username_available', { uname: username.toLowerCase() });
    if (error) return false;
    return data === true;
}
