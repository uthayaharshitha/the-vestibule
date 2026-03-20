'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UnsavedChangesContextType {
    isDirty: boolean;
    setIsDirty: (val: boolean) => void;
    confirmNavigation: (action: () => void | Promise<void>) => Promise<void>;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType>({
    isDirty: false,
    setIsDirty: () => {},
    confirmNavigation: async (action) => { await action(); },
});

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
    const [isDirty, setIsDirty] = useState(false);

    const confirmNavigation = async (action: () => void | Promise<void>) => {
        if (isDirty) {
            if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
                setIsDirty(false);
                await action();
            }
        } else {
            await action();
        }
    };

    return (
        <UnsavedChangesContext.Provider value={{ isDirty, setIsDirty, confirmNavigation }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
}

export function useUnsavedChangesContext() {
    return useContext(UnsavedChangesContext);
}
