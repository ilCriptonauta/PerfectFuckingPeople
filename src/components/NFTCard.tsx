"use client";

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { MultiversXNFT } from '@/types/nft.types';
import Image from 'next/image';
import storiesData from '@/data/stories.json';

interface NFTCardProps {
    nft: MultiversXNFT;
}

export function NFTCard({ nft }: NFTCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getAttribute = (traitType: string) => {
        return nft.metadata?.attributes?.find(a => a.trait_type === traitType)?.value || 'N/A';
    };

    const character = getAttribute('Character');
    const mission = getAttribute('Mission');
    const season = getAttribute('Season');
    const background = getAttribute('Background');
    
    const getSeasonGlowClass = () => {
        const valStr = String(season).toLowerCase();
        if (valStr.includes('collectibles')) return 'season-collectibles-glow';
        const match = valStr.match(/\d+/);
        const num = match ? parseInt(match[0], 10) : null;
        if (num === 1) return 'season-1-glow';
        if (num === 2) return 'season-2-glow';
        if (num === 3) return 'season-3-glow';
        if (num === 4) return 'season-4-glow';
        if (num === 5) return 'season-5-glow';
        return 'season-default-glow';
    };
    const glowClass = getSeasonGlowClass();
    
    // Extract number from name (e.g. "P.F.P 60" -> "60")
    const match = nft.name.match(/\d+/);
    const number = match ? match[0] : '';
    
    // Get optimized thumbnail first for gallery grid performance
    const imageUrl = nft.media?.[0]?.thumbnailUrl || nft.url || nft.media?.[0]?.url;

    // Get custom story from stories.json or fallback to description
    const customStoryEntry = (storiesData as Record<string, { name: string; story: string }>)[nft.identifier];
    const storyToShow = (customStoryEntry && customStoryEntry.story) || nft.metadata?.description || "No story available for this character.";

    const handleClick = () => {
        const next = !isFlipped;
        setIsFlipped(next);
        if (!hasBeenFlipped) setHasBeenFlipped(true);
    };

    return (
        <div 
            className={`nft-card-perspective ${isFlipped ? 'flipped' : ''}`}
            onClick={handleClick}
        >
            <div className="nft-card-inner">
                {/* FRONT */}
                <div className={`nft-card-front ${glowClass}`} style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                        position: 'relative', 
                        width: '100%', 
                        aspectRatio: '1/1', 
                        background: 'var(--background)',
                        borderTopLeftRadius: '19px',
                        borderTopRightRadius: '19px',
                        overflow: 'hidden'
                    }}>
                        {imageUrl ? (
                            <img 
                                src={imageUrl} 
                                alt={nft.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                Image Not Found
                            </div>
                        )}
                        <div style={{
                            position: 'absolute',
                            top: '12px',
                            right: '12px',
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(4px)',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            #{number}
                        </div>
                    </div>

                    {/* ── Flip Hint Overlay ── */}
                    {!hasBeenFlipped && (
                        <div className="flip-hint-overlay">
                            <div className="flip-hint-content">
                                <div className="flip-hint-icon">↻</div>
                                <span className="flip-hint-text">Tap to flip</span>
                            </div>
                            <div className="flip-hint-shimmer" />
                        </div>
                    )}

                    <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {character}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>P.F.P Collection</p>
                    </div>
                </div>

                {/* BACK */}
                <div className={`nft-card-back ${glowClass}`}>
                    <div style={{ 
                        fontSize: '3rem', 
                        fontWeight: 800, 
                        color: 'rgba(255,255,255,0.05)', 
                        position: 'absolute', 
                        top: '10px', 
                        right: '20px',
                        lineHeight: 1
                    }}>
                        #{number}
                    </div>
                    
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', marginBottom: '20px', marginTop: '10px', textAlign: 'left' }}>
                        {character}
                    </h3>

                    <div style={{ textAlign: 'left', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Season
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {season}
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Background
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    {background}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>
                                Mission
                            </div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                "{mission}"
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card from flipping back
                                setIsModalOpen(true);
                            }}
                            className="btn-about"
                            style={{
                                padding: '8px 24px',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                border: '1px solid rgba(124, 58, 237, 0.4)',
                                color: '#f3e8ff',
                            }}
                        >
                            About Character
                        </button>
                    </div>
                    
                    <div style={{ 
                        marginTop: '24px', 
                        paddingTop: '16px', 
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'left',
                        fontStyle: 'italic'
                    }}>
                        Click to flip back
                    </div>
                </div>
            </div>

            {isModalOpen && typeof document !== 'undefined' && createPortal(
                <div 
                    className="modal-overlay" 
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsModalOpen(false);
                    }}
                >
                    <div 
                        className="modal-content glass-panel" 
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            className="modal-close-btn"
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>
                        <h2 className="modal-title text-gradient" style={{ marginBottom: '16px' }}>
                            About {character}
                        </h2>
                        <div className="modal-body">
                            <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-line' }}>
                                {storyToShow}
                            </p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                <div><strong>ID:</strong> {nft.identifier}</div>
                                <div><strong>Season:</strong> {season}</div>
                                <div><strong>Mission:</strong> "{mission}"</div>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
