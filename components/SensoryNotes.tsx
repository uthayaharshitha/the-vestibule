import { CapsuleNote } from '@/types/database';

interface SensoryNotesProps {
    notes: CapsuleNote[];
    hideTitle?: boolean;
    /** When true, renders the Figma-style colored-dot + pill layout */
    isNewDesign?: boolean;
    accentColor?: string;
    accentGlow?: string;
    accentBorder?: string;
}

// Cycling accent colors for sensory note pills (matches Figma design)
const SENSORY_COLORS = [
    { dot: '#7f13ec', bg: 'rgba(127,19,236,0.15)', text: '#7f13ec', border: 'rgba(127,19,236,0.3)', glow: '#7f13ec' },
    { dot: '#22d3ee', bg: 'rgba(34,211,238,0.15)', text: '#22d3ee', border: 'rgba(34,211,238,0.3)', glow: '#22d3ee' },
    { dot: '#fb923c', bg: 'rgba(251,146,60,0.15)', text: '#fb923c', border: 'rgba(251,146,60,0.3)', glow: '#fb923c' },
    { dot: '#c084fc', bg: 'rgba(192,132,252,0.15)', text: '#c084fc', border: 'rgba(192,132,252,0.3)', glow: '#c084fc' },
    { dot: '#34d399', bg: 'rgba(52,211,153,0.15)', text: '#34d399', border: 'rgba(52,211,153,0.3)', glow: '#34d399' },
    { dot: '#f472b6', bg: 'rgba(244,114,182,0.15)', text: '#f472b6', border: 'rgba(244,114,182,0.3)', glow: '#f472b6' },
];

export default function SensoryNotes({ notes, hideTitle, isNewDesign, accentColor, accentGlow, accentBorder }: SensoryNotesProps) {
    const sortedNotes = [...notes].sort((a, b) => a.order_index - b.order_index);

    if (notes.length === 0) return null;

    if (isNewDesign) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {sortedNotes.map((note, index) => {
                    // Use dynamic accent color if provided, otherwise fallback to cycling colors
                    const color = accentColor ? {
                        dot: accentColor,
                        bg: 'transparent',
                        text: accentColor,
                        border: accentBorder || accentColor,
                        glow: accentGlow || accentColor
                    } : SENSORY_COLORS[index % SENSORY_COLORS.length];

                    return (
                        <div
                            key={note.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                        >
                            {/* Glowing dot */}
                            <span
                                style={{
                                    flexShrink: 0,
                                    width: '7px',
                                    height: '7px',
                                    borderRadius: '50%',
                                    background: color.dot,
                                    boxShadow: `0 0 5px ${color.glow || color.dot}`,
                                }}
                            />
                            {/* Pill */}
                            <span
                                className="font-mono"
                                style={{
                                    background: color.bg,
                                    color: color.text,
                                    border: `1px solid ${color.border}`,
                                    padding: '0.2rem 0.7rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.6rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                }}
                            >
                                {note.note_text}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    }

    // Legacy design (used outside capsule page)
    return (
        <div className="space-y-4">
            {!hideTitle && <h3 className="text-lg font-semibold text-gray-700">Sensory Notes</h3>}
            <div className="flex flex-wrap gap-3">
                {sortedNotes.map((note) => (
                    <div
                        key={note.id}
                        className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-sm text-[var(--text-main)] hover:border-[var(--text-secondary)] transition-colors"
                    >
                        {note.note_text}
                    </div>
                ))}
            </div>
        </div>
    );
}
