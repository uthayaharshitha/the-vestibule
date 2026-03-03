import { supabase } from './supabase';
import { Contribution } from '@/types/database';

export async function getContributions(capsuleId: string) {
  // Fetch all contributions for this capsule (top-level + replies)
  const { data, error } = await supabase
    .from('contributions')
    .select(`
            *,
            users (
                username,
                profile_image_url
            )
        `)
    .eq('capsule_id', capsuleId)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching contributions:', error);
    return { contributions: [], error };
  }

  return { contributions: data as Contribution[], error: null };
}
