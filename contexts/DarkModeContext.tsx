'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const DarkModeContext = createContext<DarkModeContextType>({
    isDarkMode: false,
    toggleDarkMode: () => { },
});

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Permanent Dark Mode Enforcement
        document.documentElement.classList.add('dark');
    }, []);

    return (
        <DarkModeContext.Provider value={{ isDarkMode: true, toggleDarkMode: () => { } }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export function useDarkMode() {
    return useContext(DarkModeContext);
}
