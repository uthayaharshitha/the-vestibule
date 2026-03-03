'use client';

import { useEffect, useState } from 'react';
import { getSavedCapsules } from '@/lib/user-mutations';
import CapsuleCard from '@/components/CapsuleCard';

export default function SavedCapsulesPage() {
    const [capsules, setCapsules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSavedCapsules().then(({ capsules: data }) => {
            setCapsules(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <p className="font-mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                [ Loading saved capsules... ]
            </p>
        );
    }

    if (capsules.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
            }}>
                <p className="font-mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    [ No saved capsules yet ]
                </p>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    Use the Save button on any capsule page to bookmark it here.
                </p>
            </div>
        );
    }

    return (
        <div>
            <p className="font-mono" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                {capsules.length} saved {capsules.length === 1 ? 'capsule' : 'capsules'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
                {capsules.map((capsule, i) => (
                    <CapsuleCard key={capsule.id} capsule={capsule} revealDelay={i * 40} />
                ))}
            </div>
        </div>
    );
}
