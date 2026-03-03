'use client';

import { useReadMode } from '@/contexts/ReadModeContext';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const { isReadMode } = useReadMode();

    // In Read Mode or Normal Mode, no extra top padding is needed 
    // because the header is now `sticky` (taking up flow space natively).
    return (
        <div className="">
            {children}
        </div>
    );
}
