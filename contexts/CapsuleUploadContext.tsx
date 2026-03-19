'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CapsuleUploadContextType {
    isPosting: boolean;
    postingProgress: number;
    postingLabel: string;
    startPosting: (label?: string) => void;
    updateProgress: (pct: number) => void;
    finishPosting: () => void;
}

const CapsuleUploadContext = createContext<CapsuleUploadContextType | undefined>(undefined);

export function useCapsuleUpload() {
    const ctx = useContext(CapsuleUploadContext);
    if (!ctx) throw new Error('useCapsuleUpload must be used within CapsuleUploadProvider');
    return ctx;
}

export function CapsuleUploadProvider({ children }: { children: ReactNode }) {
    const [isPosting, setIsPosting] = useState(false);
    const [postingProgress, setPostingProgress] = useState(0);
    const [postingLabel, setPostingLabel] = useState('Publishing capsule\u2026');

    const startPosting = useCallback((label = 'Publishing capsule\u2026') => {
        setPostingLabel(label);
        setPostingProgress(0);
        setIsPosting(true);
    }, []);

    const updateProgress = useCallback((pct: number) => {
        setPostingProgress(Math.min(100, Math.max(0, pct)));
    }, []);

    const finishPosting = useCallback(() => {
        setPostingProgress(100);
        setTimeout(() => {
            setIsPosting(false);
            setPostingProgress(0);
        }, 800);
    }, []);

    return (
        <CapsuleUploadContext.Provider value={{ isPosting, postingProgress, postingLabel, startPosting, updateProgress, finishPosting }}>
            {children}
        </CapsuleUploadContext.Provider>
    );
}
