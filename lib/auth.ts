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

export async function signUpWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
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
