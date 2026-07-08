"use client";

import React, { useState, useRef } from 'react';
import { MultiversXNFT } from "@/types/nft.types";
import { NFTCard } from "./NFTCard";

interface NFTCarouselProps {
    nfts: MultiversXNFT[];
    flippedCardId: string | null;
    onFlip: (id: string) => void;
}

export function NFTCarousel({ nfts, flippedCardId, onFlip }: NFTCarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);

    // Safeguard activeIndex when filter changes
    const items = nfts || [];
    const maxIndex = Math.max(0, items.length - 1);
    const safeActiveIndex = Math.min(activeIndex, maxIndex);

    const handlePrev = () => {
        if (safeActiveIndex > 0) {
            setActiveIndex(safeActiveIndex - 1);
            onFlip(""); // flip back active card
        }
    };

    const handleNext = () => {
        if (safeActiveIndex < items.length - 1) {
            setActiveIndex(safeActiveIndex + 1);
            onFlip(""); // flip back active card
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchStartX.current - touchEndX;
        const threshold = 50; // pixels

        if (diff > threshold) {
            handleNext();
        } else if (diff < -threshold) {
            handlePrev();
        }
        touchStartX.current = null;
    };

    const handleCardWrapperClick = (index: number, e: React.MouseEvent) => {
        if (index !== safeActiveIndex) {
            // Clicked a side card: navigate to it instead of triggering flip
            e.preventDefault();
            e.stopPropagation();
            setActiveIndex(index);
            onFlip(""); // flip back active card
        }
    };

    if (items.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Perfect Fucking People found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Try selecting a different season filter.
                </p>
            </div>
        );
    }

    // Render active card, 2 cards before, and 2 cards after
    const visibleRange = 2;
    const visibleItems = items
        .map((nft, idx) => ({ nft, idx }))
        .filter(({ idx }) => idx >= safeActiveIndex - visibleRange && idx <= safeActiveIndex + visibleRange);

    const getCardStyle = (idx: number) => {
        const diff = idx - safeActiveIndex;
        let transform = "";
        let opacity = 0;
        let zIndex = 0;
        let pointerEvents: 'auto' | 'none' = 'none';

        if (diff === 0) {
            transform = "translateX(0) scale(1) rotateY(0)";
            opacity = 1;
            zIndex = 10;
            pointerEvents = 'auto';
        } else if (diff === 1) {
            transform = "translateX(var(--translate-offset)) scale(0.82) rotateY(-18deg)";
            opacity = 0.55;
            zIndex = 5;
        } else if (diff === -1) {
            transform = "translateX(calc(-1 * var(--translate-offset))) scale(0.82) rotateY(18deg)";
            opacity = 0.55;
            zIndex = 5;
        } else if (diff === 2) {
            transform = "translateX(calc(1.8 * var(--translate-offset))) scale(0.66) rotateY(-32deg)";
            opacity = 0.15;
            zIndex = 2;
        } else if (diff === -2) {
            transform = "translateX(calc(-1.8 * var(--translate-offset))) scale(0.66) rotateY(32deg)";
            opacity = 0.15;
            zIndex = 2;
        }

        return {
            transform,
            opacity,
            zIndex,
            pointerEvents,
        };
    };

    return (
        <div 
            className="deck-carousel-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            {/* Left navigation arrow */}
            {safeActiveIndex > 0 && (
                <button 
                    onClick={handlePrev}
                    className="deck-arrow left"
                    aria-label="Previous card"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
            )}

            {/* Cards Stack Container */}
            <div className="deck-stack">
                {visibleItems.map(({ nft, idx }) => {
                    const cardStyle = getCardStyle(idx);
                    return (
                        <div 
                            key={nft.identifier} 
                            className={`deck-card-wrapper ${idx === safeActiveIndex ? 'active' : ''}`}
                            style={cardStyle}
                            onClick={(e) => handleCardWrapperClick(idx, e)}
                        >
                            <NFTCard 
                                nft={nft} 
                                isFlipped={flippedCardId === nft.identifier}
                                onFlip={() => onFlip(nft.identifier)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Right navigation arrow */}
            {safeActiveIndex < items.length - 1 && (
                <button 
                    onClick={handleNext}
                    className="deck-arrow right"
                    aria-label="Next card"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            )}

            {/* Progress dots matrix or simple index display */}
            <div className="deck-dots">
                {items.length <= 15 ? (
                    items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveIndex(idx);
                                onFlip("");
                            }}
                            className={`deck-dot ${idx === safeActiveIndex ? 'active' : ''}`}
                            aria-label={`Go to card ${idx + 1}`}
                        />
                    ))
                ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>
                        {safeActiveIndex + 1} / {items.length}
                    </span>
                )}
            </div>
        </div>
    );
}
