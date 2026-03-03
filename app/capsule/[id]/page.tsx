import { getCapsuleById } from '@/lib/capsule-queries';
import AppHeader from '@/components/AppHeader';
import CapsuleContent from '@/components/CapsuleContent';
import { notFound } from 'next/navigation';

interface CapsulePageProps {
    params: Promise<{ id: string }>;
}

// Helper function to calculate text color based on background luminance
function getContrastColor(hexColor: string): string {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5 ? '#FFFFFF' : '#000000';
}

export default async function CapsulePage({ params }: CapsulePageProps) {
    const { id } = await params;
    const { capsule, error } = await getCapsuleById(id);

    if (error || !capsule) {
        notFound();
    }

    const themeColor = capsule.theme_color || '#F5F5F5';
    const textColor = getContrastColor(themeColor);
    const isLightText = textColor === '#FFFFFF';

    return (
        <>
            {/* Inject dynamic header variables globally for AppHeader to consume */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --header-bg-override: ${themeColor}dd;
                    --header-border-override: ${textColor}22;
                    --header-text-override: ${textColor};
                }
            `}} />
            <main className="capsule-page-enter" style={{ backgroundColor: themeColor, minHeight: '100vh' }}>
                <CapsuleContent
                    capsule={capsule}
                    id={id}
                    themeColor={themeColor}
                    textColor={textColor}
                    isLightText={isLightText}
                />
            </main>
        </>
    );
}
