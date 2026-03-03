'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();
    const [status, setStatus] = useState('Confirming your account…');

    useEffect(() => {
        const handleCallback = async () => {
            // Process token in URL (handles both hash fragments and PKCE code)
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                setStatus('Something went wrong. Please try signing in.');
                setTimeout(() => router.replace('/login'), 3000);
                return;
            }

            const user = session.user;
            const desiredUsername = user.user_metadata?.username ?? null;

            setStatus('Setting up your profile…');

            // Upsert base profile row (role, status)
            await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    role: 'user',
                    is_anonymous: false,
                    username: desiredUsername,
                    status: 'active',
                }, { onConflict: 'id' });

            // Check if the user ended up with a username
            const { data: profile } = await supabase
                .from('users')
                .select('username')
                .eq('id', user.id)
                .single();

            if (!profile?.username) {
                // OAuth sign-in (Google etc.) — no username yet, must pick one
                setStatus('Almost there…');
                router.replace('/onboarding/username');
            } else {
                // Email signup — username already set, go straight to profile pic onboarding
                setStatus('Almost there…');
                router.replace('/onboarding/profile');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <main style={{
            minHeight: '100vh',
            background: '#0a0a0a',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
        }}>
            <div style={{
                width: '36px',
                height: '36px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderTopColor: 'rgba(255,255,255,0.7)',
                borderRadius: '50%',
                animation: 'spin 0.9s linear infinite',
            }} />
            <p style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
            }}>
                {status}
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </main>
    );
}
