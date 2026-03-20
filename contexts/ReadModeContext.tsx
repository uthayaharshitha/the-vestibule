'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ReadModeContextType {
    isReadMode: boolean;
    setIsReadMode: (value: boolean) => void;
}

const ReadModeContext = createContext<ReadModeContextType>({
    isReadMode: false,
    setIsReadMode: () => { },
});

export function ReadModeProvider({ children }: { children: ReactNode }) {
    const [isReadMode, setIsReadMode] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isReadMode) {
            if (!document.fullscreenElement) {
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen().catch((err) => {
                        console.warn("Fullscreen API failed, relying on CSS fallback:", err);
                    });
                }
            }
        } else {
            if (document.fullscreenElement) {
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(() => {});
                }
            }
        }
    }, [isReadMode]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && isReadMode) {
                setIsReadMode(false);
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [isReadMode]);

    return (
        <ReadModeContext.Provider value={{ isReadMode, setIsReadMode }}>
            {children}
        </ReadModeContext.Provider>
    );
}

export function useReadMode() {
    return useContext(ReadModeContext);
}
