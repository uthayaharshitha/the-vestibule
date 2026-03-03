import { supabase } from './supabase';

export async function ensureAnonymousUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return { user: session.user, error: null };

    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
        console.error('Error creating anonymous user:', error);
        return { user: null, error };
    }
    return { user: data.user, error: null };
}

export async function getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user || null;
}

// ── Sign up with email + username ─────────────────────────────────────────
export async function signUpWithEmail(email: string, password: string, username?: string) {
    // 1. Check username availability before signing up (no point creating auth if username taken)
    if (username) {
        const clean = username.toLowerCase().trim();
        const { data: available, error: rpcErr } = await supabase.rpc('is_username_available', { uname: clean });
        if (rpcErr) {
            // RPC might not exist yet (migration not run) — skip check, handle DB error later
            console.warn('is_username_available RPC not available:', rpcErr.message);
        } else if (!available) {
            return { data: null, error: { message: 'Username is already taken. Please choose another.' } };
        }
    }

    // 2. Create auth user — store username in metadata so /auth/callback can save it after confirmation
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { username: username ? username.toLowerCase().trim() : null },
            // emailRedirectTo tells Supabase where to send the user after confirming
            emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error || !data.user) return { data, error };

    return { data, error: null };
}

export async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}
