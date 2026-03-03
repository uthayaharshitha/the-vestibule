'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastContextType {
    showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const showToast = useCallback((msg: string) => {
        setMessage(msg);
        setIsVisible(true);

        setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setMessage(null), 300); // Wait for fade out
        }, 2500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {message && (
                <div
                    className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-md border border-white/10 transition-opacity duration-300"
                    style={{
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-color)',
                        opacity: isVisible ? 1 : 0,
                        pointerEvents: 'none'
                    }}
                >
                    <p className="text-sm font-medium">{message}</p>
                </div>
            )}
        </ToastContext.Provider>
    );
}
