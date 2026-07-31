"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MultiversXNFT } from '@/types/nft.types';
import Image from 'next/image';
import storiesData from '@/data/stories.json';
import { HolderCardStudio } from './HolderCardStudio';

interface NFTCardProps {
    nft: MultiversXNFT;
    isFlipped: boolean;
    onFlip: () => void;
    isUnowned?: boolean;
    isAllCollectionView?: boolean;
}

export function NFTCard({ nft, isFlipped, onFlip, isUnowned = false, isAllCollectionView = false }: NFTCardProps) {
    const [hasBeenFlipped, setHasBeenFlipped] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
    const [holdingDays, setHoldingDays] = useState<number | null>(null);

    useEffect(() => {
        if (isUnowned || !isFlipped || holdingDays !== null) return;
        let isMounted = true;

        const fetchHoldingTime = async () => {
            const now = Math.floor(Date.now() / 1000);
            let ts: number | null = null;

            try {
                const res = await fetch(`https://api.multiversx.com/nfts/${nft.identifier}/transactions?status=success&size=5`);
                if (res.ok) {
                    const txs = await res.json();
                    if (Array.isArray(txs) && txs.length > 0 && txs[0]?.timestamp) {
                        ts = txs[0].timestamp;
                    }
                }
            } catch (e) {}

            if (!ts) {
                try {
                    const singleRes = await fetch(`https://api.multiversx.com/nfts/${nft.identifier}`);
                    if (singleRes.ok) {
                        const sData = await singleRes.json();
                        if (sData?.timestamp) {
                            ts = sData.timestamp;
                        }
                    }
                } catch (e) {}
            }

            if (isMounted && ts) {
                const days = Math.max(1, Math.floor((now - ts) / 86400));
                setHoldingDays(days);
            }
        };

        fetchHoldingTime();

        return () => {
            isMounted = false;
        };
    }, [isUnowned, isFlipped, nft.identifier, holdingDays]);

    useEffect(() => {
        const checkAvatar = () => {
            try {
                const stored = localStorage.getItem("pfp_user_avatar");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setSelectedAvatarId(parsed?.identifier || null);
                } else {
                    setSelectedAvatarId(null);
                }
            } catch (e) {
                setSelectedAvatarId(null);
            }
        };

        checkAvatar();
        if (typeof window !== "undefined") {
            window.addEventListener("pfp_avatar_changed", checkAvatar);
            return () => window.removeEventListener("pfp_avatar_changed", checkAvatar);
        }
    }, []);

    const isCurrentAvatar = selectedAvatarId === nft.identifier;

    const getAttribute = (traitType: string) => {
        return nft.metadata?.attributes?.find(a => a.trait_type === traitType)?.value || 'N/A';
    };

    const character = getAttribute('Character');
    const mission = getAttribute('Mission');
    const season = getAttribute('Season');
    const background = getAttribute('Background');
    const honorary = getAttribute('Honorary');
    
    const getSeasonGlowClass = () => {
        if (honorary !== 'N/A') {
            return isAllCollectionView && !isUnowned ? 'all-collection-honorary-glow' : 'season-honorary-glow';
        }

        if (isAllCollectionView && !isUnowned) {
            const valStr = String(season).toLowerCase();
            if (valStr.includes('collectibles')) {
                return 'all-collection-collectibles-glow';
            }
            const match = valStr.match(/\d+/);
            const num = match ? parseInt(match[0], 10) : null;
            if (num && num >= 1 && num <= 5) {
                return 'all-collection-og-glow';
            }
        }

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
    // Get high resolution image for downloading
    const downloadUrl = nft.url || nft.media?.[0]?.url || nft.media?.[0]?.thumbnailUrl;

    // Get custom story from stories.json or fallback to description
    const customStoryEntry = (storiesData as Record<string, { name: string; story: string }>)[nft.identifier];
    const storyToShow = (customStoryEntry && customStoryEntry.story) || nft.metadata?.description || "No story available for this character.";

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onFlip();
        if (!hasBeenFlipped) setHasBeenFlipped(true);
    };


    return (
        <div 
            className={`nft-card-perspective ${isFlipped ? 'flipped' : ''} ${isUnowned ? 'unowned-card' : ''}`}
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
                        {isUnowned && (
                            <div className="lock-badge">
                                🔒 Locked
                            </div>
                        )}
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

                        {!isUnowned && holdingDays !== null && (
                            <div>
                                <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Holding Streak
                                </div>
                                <div style={{ 
                                    fontSize: '0.82rem', 
                                    fontWeight: 700, 
                                    color: '#34d399', 
                                    background: 'rgba(16, 185, 129, 0.12)', 
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    <span>🗓️</span>
                                    <span>Holding for {holdingDays} days</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', marginTop: '20px', marginBottom: '8px' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent card from flipping back
                                setIsModalOpen(true);
                            }}
                            className="btn-about"
                            title="About Character"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: '1px solid rgba(124, 58, 237, 0.4)',
                                background: 'rgba(124, 58, 237, 0.15)',
                                color: '#d8b4fe',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                        </button>
                        {!isUnowned && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsStudioOpen(true);
                                }}
                                className="btn-share"
                                title="Create & Share Holder Card on X"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(236, 72, 153, 0.4)',
                                    background: 'rgba(236, 72, 153, 0.15)',
                                    color: '#fbcfe8',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </button>
                        )}
                        <a
                            href={downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="btn-download"
                            title="Download NFT Image"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                background: 'rgba(56, 189, 248, 0.15)',
                                color: '#7dd3fc',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        </a>
                        {!isUnowned && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const avatarObj = {
                                        identifier: nft.identifier,
                                        name: nft.name,
                                        character: String(character),
                                        imageUrl
                                    };
                                    localStorage.setItem("pfp_user_avatar", JSON.stringify(avatarObj));
                                    window.dispatchEvent(new Event("pfp_avatar_changed"));
                                }}
                                className={`btn-set-avatar ${isCurrentAvatar ? 'active' : ''}`}
                                title={isCurrentAvatar ? "Current Profile Avatar" : "Set as Profile Avatar"}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: isCurrentAvatar ? '1px solid #10b981' : '1px solid rgba(16, 185, 129, 0.4)',
                                    background: isCurrentAvatar ? 'rgba(16, 185, 129, 0.35)' : 'rgba(16, 185, 129, 0.15)',
                                    color: isCurrentAvatar ? '#34d399' : '#6ee7b7',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isCurrentAvatar ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none'
                                }}
                            >
                                {isCurrentAvatar ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                )}
                            </button>
                        )}
                    </div>
                    
                    <div style={{ 
                        marginTop: '16px', 
                        paddingTop: '12px', 
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

            {/* Holder Card Studio */}
            <HolderCardStudio 
                nft={nft}
                isOpen={isStudioOpen}
                onClose={() => setIsStudioOpen(false)}
            />

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

                            {!isUnowned && (
                                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setIsStudioOpen(true);
                                        }}
                                        style={{
                                            padding: '10px 20px',
                                            borderRadius: '10px',
                                            background: 'linear-gradient(90deg, #ec4899, #7c3aed)',
                                            color: '#ffffff',
                                            border: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        🎨 Open Card Studio for X
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
