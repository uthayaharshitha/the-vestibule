'use client';

import { Suspense, useEffect, useState } from 'react';
import CapsuleCreationForm from '@/components/CapsuleCreationForm';
import { getCurrentUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function CreateCapsulePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCurrentUser().then(user => {
            if (!user || user.is_anonymous) {
                router.replace('/feed');
            } else {
                setLoading(false);
            }
        });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen py-12 px-4 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-secondary)' }}>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--text-main)' }}>Create New Capsule</h1>
                    <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
                        Preserve a fleeting moment. Upload images, videos, and ambient sounds.
                    </p>
                </div>

                <div className="border rounded-md overflow-hidden" style={{ background: 'var(--bg-main)', borderColor: 'var(--border-color)' }}>
                    <Suspense fallback={<div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>Loading...</div>}>
                        <CapsuleCreationForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
