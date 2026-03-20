'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUnsavedChangesContext } from '@/contexts/UnsavedChangesContext';

export function useUnsavedChanges(isDirty: boolean) {
    const router = useRouter();
    const { setIsDirty } = useUnsavedChangesContext();

    useEffect(() => {
        setIsDirty(isDirty);
        return () => setIsDirty(false); // Clean up
    }, [isDirty, setIsDirty]);

    useEffect(() => {
        // beforeunload for tab close / refresh
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    useEffect(() => {
        // capture click on links for internal routing
        const handleClick = (e: MouseEvent) => {
            if (!isDirty) return;

            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor && anchor.href) {
                // Ignore external links, new tabs, or same page hash links
                if (anchor.target === '_blank') return;
                
                try {
                    const url = new URL(anchor.href);
                    
                    // If it's an internal link
                    if (url.origin === window.location.origin) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Show native confirmation dialog
                        if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                            // Proceed with navigation
                            setIsDirty(false);
                            router.push(url.pathname + url.search + url.hash);
                        }
                    }
                } catch (err) {
                    // Ignore invalid URLs
                }
            }
        };

        document.addEventListener('click', handleClick, { capture: true });
        return () => document.removeEventListener('click', handleClick, { capture: true });
    }, [isDirty, router, setIsDirty]);
}
