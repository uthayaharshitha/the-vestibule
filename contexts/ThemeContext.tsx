'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDarkMode: false,
    toggleDarkMode: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Permanent Dark Mode Enforcement
    return (
        <ThemeContext.Provider value={{ isDarkMode: true, toggleDarkMode: () => { } }}>
            <div className="dark">
                {children}
            </div>
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
