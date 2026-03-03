import { supabase } from './supabase';

// ── Fetch all reports, enriched with linked content (admin only) ──────────
// The reports table uses a polymorphic target_id (no FK to capsules/contributions),
// so we manually enrich after fetching reports.
export async function getAllReports() {
  const { data: reports, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return { reports: [], error };
  }

  if (!reports || reports.length === 0) {
    return { reports: [], error: null };
  }

  // Collect IDs by type
  const capsuleIds = reports
    .filter((r) => r.target_type === 'capsule')
    .map((r) => r.target_id);

  const contributionIds = reports
    .filter((r) => r.target_type === 'contribution')
    .map((r) => r.target_id);

  // Batch fetch capsules
  const capsulesMap: Record<string, { id: string; title: string; status: string }> = {};
  if (capsuleIds.length > 0) {
    const { data: capsules } = await supabase
      .from('capsules')
      .select('id, title, status')
      .in('id', capsuleIds);
    (capsules || []).forEach((c) => { capsulesMap[c.id] = c; });
  }

  // Batch fetch contributions
  const contributionsMap: Record<string, { id: string; content_text: string; content_type: string; status: string }> = {};
  if (contributionIds.length > 0) {
    const { data: contributions } = await supabase
      .from('contributions')
      .select('id, content_text, content_type, status')
      .in('id', contributionIds);
    (contributions || []).forEach((c) => { contributionsMap[c.id] = c; });
  }

  // Enrich reports with linked content
  const enriched = reports.map((r) => ({
    ...r,
    capsules: r.target_type === 'capsule' ? (capsulesMap[r.target_id] ?? null) : null,
    contributions: r.target_type === 'contribution' ? (contributionsMap[r.target_id] ?? null) : null,
  }));

  return { reports: enriched, error: null };
}

// ── Check if the currently authenticated user is an admin ─────────────────
// Uses a SECURITY DEFINER RPC function to bypass RLS — most reliable approach.
export async function checkAdminStatus(): Promise<{
  isAdmin: boolean;
  userId: string | null;
  role: string | null;
  errorMsg: string | null;
}> {
  // Get session for user ID display
  const { data: sessionData } = await supabase.auth.getSession();
  let userId = sessionData?.session?.user?.id ?? null;

  if (!userId) {
    const { data: userData } = await supabase.auth.getUser();
    userId = userData?.user?.id ?? null;
  }

  if (!userId) {
    return { isAdmin: false, userId: null, role: null, errorMsg: 'No active session' };
  }

  // Call the SECURITY DEFINER function — bypasses RLS entirely
  const { data: role, error } = await supabase.rpc('get_my_role');

  console.log('[checkAdminStatus] userId:', userId, '| role:', role, '| error:', error?.message);

  if (error) {
    return { isAdmin: false, userId, role: null, errorMsg: error.message };
  }

  return { isAdmin: role === 'admin', userId, role: role ?? null, errorMsg: null };
}

// Simple boolean helper (backwards compat)
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { isAdmin } = await checkAdminStatus();
  return isAdmin;
}
