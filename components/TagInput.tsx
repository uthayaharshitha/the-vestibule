'use client';

import { useState } from 'react';

interface TagInputProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    max?: number;
    placeholder?: string;
    prefix?: string; // e.g. '#' for hashtags
}

export default function TagInput({
    label,
    tags,
    onChange,
    max,
    placeholder = 'Type and press Enter',
    prefix = '',
}: TagInputProps) {
    const [input, setInput] = useState('');

    const isAtMax = max !== undefined && tags.length >= max;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const value = input.trim().toLowerCase().replace(/^#/, '');
            if (value && !tags.includes(value) && !isAtMax) {
                onChange([...tags, value]);
                setInput('');
            }
        }
    };

    const handleRemove = (index: number) => {
        onChange(tags.filter((_, i) => i !== index));
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-main)' }}>
                {label}{max !== undefined ? ` (Max ${max})` : ''}
            </label>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAtMax ? `MAXIMUM ${max} REACHED` : typeof placeholder === 'string' ? placeholder.toUpperCase() : placeholder}
                disabled={isAtMax}
                className="archive-input"
                style={{
                    opacity: isAtMax ? 0.5 : 1,
                }}
            />
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                            style={{
                                background: 'var(--bg-tertiary)',
                                color: 'var(--text-main)',
                                border: '1px solid var(--border-color)',
                            }}
                        >
                            {prefix}{tag}
                            <button
                                type="button"
                                onClick={() => handleRemove(index)}
                                className="hover:opacity-70 transition-opacity ml-1"
                                style={{ color: 'var(--text-secondary)' }}
                                aria-label={`Remove ${tag}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
