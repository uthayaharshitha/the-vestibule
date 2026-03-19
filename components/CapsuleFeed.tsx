'use client';

import { useEffect, useRef } from 'react';
import { useCapsules } from '@/hooks/useCapsules';
import CapsuleCard from './CapsuleCard';
import SkeletonCard from './SkeletonCard';

export default function CapsuleFeed() {
    const { capsules, loading, hasMore, error, loadMore } = useCapsules();
    const observerTarget = useRef<HTMLDivElement>(null);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadMore]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 relative z-10 bg-grain-fix">
            <div className="mb-12 border-l-4 border-[#991b1b] pl-4 sm:pl-8">
                <div className="flex flex-wrap items-center gap-4 mb-4"></div>
                <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-white uppercase break-words">
                    MEMORY REPOSITORY
                </h1>
                <p className="text-[11px] text-gray-500 font-mono mt-4 uppercase tracking-[0.3em]">
                    Query result count: {capsules.length} entries
                </p>
            </div>

            {capsules.length === 0 && !loading ? (
                <div className="text-center py-12">
                    <p className="text-[11px] text-gray-500 font-mono mt-4 uppercase tracking-[0.3em]">
                        NO RECORDS FOUND IN THIS SECTOR.
                    </p>
                </div>
            ) : (
                <div className="masonry-grid relative z-20">
                    {capsules.map((capsule, index) => (
                        <CapsuleCard
                            key={capsule.id}
                            capsule={capsule}
                            revealDelay={Math.min(index * 40, 240)}
                        />
                    ))}

                    {/* Show skeletons during infinite scroll loading */}
                    {loading && capsules.length > 0 && (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    )}
                </div>
            )}

            {/* Initial loading skeletons */}
            {loading && capsules.length === 0 && (
                <div className="masonry-grid relative z-20">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            )}

            {/* Intersection observer target */}
            <div ref={observerTarget} className="h-4" />

            {/* End of feed message */}
            {!hasMore && capsules.length > 0 && (
                <div className="mt-24 flex flex-col items-center gap-8 relative z-20">
                    <div className="flex items-center gap-4 w-full max-w-md">
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                        <div className="px-10 py-4 text-white/50 font-black text-[10px] uppercase tracking-[0.5em]">
                            END OF ARCHIVE
                        </div>
                        <div className="h-[1px] flex-1 bg-white/10"></div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .masonry-grid {
                    column-count: 1;
                    column-gap: 1.5rem;
                }
                
                @media (min-width: 768px) {
                    .masonry-grid {
                        column-count: 2;
                    }
                }

                @media (min-width: 1024px) {
                    .masonry-grid {
                        column-count: 3;
                    }
                }

                @media (min-width: 1440px) {
                    .masonry-grid {
                        column-count: 4;
                    }
                }

                :global(.feed-card) {
                    break-inside: avoid;
                    margin-bottom: 2rem;
                    position: relative;
                    z-index: 20;
                    display: inline-block;
                    width: 100%;
                }
            `}</style>
        </div>
    );
}
