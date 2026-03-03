import { supabase } from './supabase';
import { ensureAnonymousUser } from './auth';

export async function createContribution(
    capsuleId: string,
    contentText: string,
    contentType: 'writing' | 'reflection' | 'poem' = 'writing',
    pseudonym?: string,
    isAnonymous: boolean = false,
    boxColor: string = '#F5F5F5',
    parentId?: string
) {
    // Ensure user has an anonymous session
    const { user, error: authError } = await ensureAnonymousUser();

    if (authError || !user) {
        return { contribution: null, error: authError || new Error('Failed to create user') };
    }

    // Update pseudonym if provided AND not posting anonymously? 
    // Actually, if posting anonymously, we might still want to update the user's pseudonym for future?
    // User requested "option to post anonymously".
    // If checked, we set is_anonymous=true.
    // We should probably NOT update the global pseudonym if they are posting anonymously this time.
    if (pseudonym && !isAnonymous) {
        await supabase
            .from('users')
            .update({ pseudonym })
            .eq('id', user.id);
    }

    // Insert contribution
    const { data, error } = await supabase
        .from('contributions')
        .insert({
            capsule_id: capsuleId,
            user_id: user.id,
            content_type: contentType,
            content_text: contentText,
            status: 'active',
            is_anonymous: isAnonymous,
            pseudonym: isAnonymous ? null : (pseudonym || null), // Snapshot the name unless anonymous
            box_color: boxColor,
            parent_id: parentId || null
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating contribution:', error);
        return { contribution: null, error };
    }

    return { contribution: data, error: null };
}
