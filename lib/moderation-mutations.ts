import { supabase } from './supabase';

// ── Submit a report (capsule or contribution) ─────────────────────────────
export async function createReport(
    targetType: 'capsule' | 'contribution',
    targetId: string,
    reason: string,
    additionalDetails?: string
) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('reports')
        .insert({
            reporter_id: user?.id || null,
            target_type: targetType,
            target_id: targetId,
            reason,
            additional_details: additionalDetails || null,
            status: 'pending',
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating report:', error);
        return { report: null, error };
    }

    return { report: data, error: null };
}

// ── Update a contribution's moderation status (admin only) ────────────────
export async function updateContributionStatus(
    contributionId: string,
    status: 'active' | 'flagged' | 'removed'
) {
    const { data, error } = await supabase
        .from('contributions')
        .update({ status })
        .eq('id', contributionId)
        .select()
        .single();

    if (error) {
        console.error('Error updating contribution status:', error);
        return { contribution: null, error };
    }

    return { contribution: data, error: null };
}

// ── Update a capsule's moderation status (admin only) ─────────────────────
export async function updateCapsuleStatus(
    capsuleId: string,
    status: 'active' | 'flagged' | 'removed'
) {
    const { data, error } = await supabase
        .from('capsules')
        .update({ status })
        .eq('id', capsuleId)
        .select()
        .single();

    if (error) {
        console.error('Error updating capsule status:', error);
        return { capsule: null, error };
    }

    return { capsule: data, error: null };
}

// ── Update a report's review status (admin only) ──────────────────────────
export async function updateReportStatus(
    reportId: string,
    status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
) {
    const { data, error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId)
        .select()
        .single();

    if (error) {
        console.error('Error updating report status:', error);
        return { report: null, error };
    }

    return { report: data, error: null };
}
