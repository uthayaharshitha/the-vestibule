import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent Next.js from statically evaluating this route at build time
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest) {
    // Create admin client lazily inside handler (not at module level)
    // so it doesn't fail at build time when env vars aren't set yet
    const supabaseAdmin = createClient(
        process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
        { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Get the user's own session from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // 2. Verify the token and get the user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    if (user.is_anonymous) {
        return NextResponse.json({ error: 'Guests cannot delete accounts' }, { status: 403 });
    }

    // 3. Delete public.users row first — this frees the username immediately
    //    (don't rely solely on the DB trigger which may not fire on auth.users)
    await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id);

    // 4. Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (deleteError) {
        console.error('Account deletion error:', deleteError);
        return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
