'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

    return (
        <ReadModeContext.Provider value={{ isReadMode, setIsReadMode }}>
            {children}
        </ReadModeContext.Provider>
    );
}

export function useReadMode() {
    return useContext(ReadModeContext);
}
