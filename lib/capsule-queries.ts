import { supabase } from './supabase';
import { Capsule } from '@/types/database';

export async function getCapsules(limit: number = 10, cursor?: string) {

    let query = supabase
        .from('capsules')
        .select(`
            *,
            capsule_tags (
                tags (
                    id,
                    name
                )
            )
        `)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(limit);

    // Cursor-based pagination
    if (cursor) {
        query = query.lt('created_at', cursor);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching capsules:', error);
        return { capsules: [], error };
    }

    return { capsules: data as Capsule[], error: null };
}


export async function getCapsuleById(id: string) {
    const { data, error } = await supabase
        .from('capsules')
        .select(`
      *,
      capsule_media (*),
      capsule_audio (*),
      capsule_notes (*),
      users (
        username,
        profile_image_url
      )
    `)
        .eq('id', id)
        .eq('status', 'active')
        .eq('visibility', 'public')
        .maybeSingle();

    if (error) {
        console.error('Error fetching capsule:', JSON.stringify(error, null, 2));
        console.error('Capsule ID:', id);
        return { capsule: null, error };
    }

    return { capsule: data, error: null };
}

export async function getRandomCapsule() {
    const { data, error } = await supabase
        .from('capsules')
        .select('id')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .limit(1000); // Get a reasonable pool

    if (error || !data || data.length === 0) {
        console.error('Error fetching random capsule:', error);
        return { capsule: null, error };
    }

    // Pick random from results
    const randomIndex = Math.floor(Math.random() * data.length);
    return { capsule: data[randomIndex], error: null };
}
