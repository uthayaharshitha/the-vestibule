import CapsuleEditForm from '@/components/CapsuleEditForm';
import AppHeader from '@/components/AppHeader';

export default async function EditCapsulePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <main className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
            <AppHeader />
            <div className="pt-20">
                <CapsuleEditForm capsuleId={id} />
            </div>
        </main>
    );
}
