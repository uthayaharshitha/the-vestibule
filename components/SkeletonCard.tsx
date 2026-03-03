export default function SkeletonCard() {
    return (
        <div
            className="masonry-card rounded-md overflow-hidden bg-[var(--bg-secondary)]"
            style={{
                background: 'var(--bg-tertiary)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
        >
            {/* Image placeholder */}
            <div
                className="w-full"
                style={{
                    height: '200px',
                    background: 'var(--border-color)'
                }}
            />

            {/* Content placeholder */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div
                    className="h-5 rounded"
                    style={{
                        background: 'var(--border-color)',
                        width: '70%'
                    }}
                />

                {/* Description lines */}
                <div
                    className="h-3 rounded"
                    style={{
                        background: 'var(--border-color)',
                        width: '90%'
                    }}
                />
                <div
                    className="h-3 rounded"
                    style={{
                        background: 'var(--border-color)',
                        width: '60%'
                    }}
                />
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}
