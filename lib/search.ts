import { supabase } from './supabase';
import { Capsule } from '@/types/database';

export interface Tag {
    id: string;
    name: string;
}

export async function searchCapsulesByTag(_tag: string) {
    // Hashtag feature removed — always returns empty
    return { capsules: [], error: null };
}

export async function getAllTags() {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching tags:', error);
        return { tags: [], error };
    }

    return { tags: data as Tag[], error: null };
}

export async function getCapsulesBySearchTerm(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return { capsules: [], error: null };

    const FULL_SELECT = `
        *,
        capsule_notes (*)
    `;

    // Pass 1: IDs matching title or description
    const { data: titleMatches } = await supabase
        .from('capsules')
        .select('id')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .or(`title.ilike.%${trimmed}%,description.ilike.%${trimmed}%`)
        .limit(30);

    // Merged IDs, deduplicated
    const idSet = new Set<string>();
    (titleMatches || []).forEach((r: any) => idSet.add(r.id));

    if (idSet.size === 0) return { capsules: [], error: null };

    // Fetch full data for matched IDs
    const { data, error } = await supabase
        .from('capsules')
        .select(FULL_SELECT)
        .in('id', Array.from(idSet))
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Search fetch error:', error);
        return { capsules: [], error };
    }

    return { capsules: data as Capsule[], error: null };
}

