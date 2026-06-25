"use client";

import { useEffect, useState, useRef } from "react";
import { ConnectButton } from "./ConnectButton";
import { MultiversXNFT } from "@/types/nft.types";

const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export function HeroSection() {
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [carouselNfts, setCarouselNfts] = useState<MultiversXNFT[]>([]);
    const [bannerNft, setBannerNft] = useState<MultiversXNFT | null>(null);
    const [collectionStats, setCollectionStats] = useState<{
        floorPrice: number | null;
        holderCount: number | null;
        nftsListed: number | null;
        totalVolume: number | null;
        averagePrice: number | null;
    }>({
        floorPrice: null,
        holderCount: null,
        nftsListed: null,
        totalVolume: null,
        averagePrice: null,
    });
    
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch supply count from MultiversX API
        fetch("https://api.multiversx.com/collections/PFP-717e46/nfts/count")
            .then((res) => res.json())
            .then((count) => {
                if (typeof count === "number") {
                    setTotalItems(count);
                }
            })
            .catch(() => {
                // Silently fail — just don't update the count
            });

        // Fetch holderCount from OOX collection details
        fetch("https://api.oox.art/collections/PFP-717e46")
            .then(res => res.json())
            .then(data => {
                if (data && typeof data.holderCount === "number") {
                    setCollectionStats(prev => ({ ...prev, holderCount: data.holderCount }));
                }
            })
            .catch(() => {});

        // Fetch stats from OOX collections-stats
        fetch("https://api.oox.art/collections-stats?collections=PFP-717e46")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const stats = data[0];
                    setCollectionStats(prev => ({
                        ...prev,
                        floorPrice: stats.floorPrice,
                        nftsListed: stats.nftsListed,
                        totalVolume: stats.totalVolume,
                        averagePrice: stats.averagePrice
                    }));
                }
            })
            .catch(() => {});

        // Fetch PFP NFTs for the home page carousel
        fetch("https://api.multiversx.com/collections/PFP-717e46/nfts?size=60")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const shuffled = shuffleArray(data);
                    // Take 12 items for the carousel
                    setCarouselNfts(shuffled.slice(0, 12));
                    // Pick a random one for the banner card
                    setBannerNft(shuffled[12] || shuffled[0]);
                }
            })
            .catch((err) => {
                console.error("Error fetching carousel NFTs:", err);
            });
    }, []);

    const handleScrollDown = () => {
        bannerRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const displayCount = totalItems !== null
        ? totalItems.toLocaleString("en-US")
        : "—";

    return (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem 0',
                position: 'relative',
                overflow: 'hidden',
                width: '100%'
            }}>
                {/* Ambient Background Glows */}
                <div style={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, rgba(10, 10, 15, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: -1,
                }} className="pulse-glow" />

                <div className="animate-float" style={{ textAlign: 'center', maxWidth: '800px', zIndex: 1, padding: '0 2rem' }}>
                    <h2 style={{ 
                        fontSize: '1.2rem', 
                        letterSpacing: '4px', 
                        textTransform: 'uppercase', 
                        color: 'var(--accent-secondary)',
                        marginBottom: '1rem',
                        fontWeight: 600
                    }}>
                        Welcome to the
                    </h2>
                    
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 6rem)',
                        lineHeight: 1.1,
                        marginBottom: '1.5rem',
                        textShadow: '0 10px 30px rgba(0,0,0,0.5)'
                    }}>
                        <span style={{ color: 'var(--text-primary)' }}>Perfect </span>
                        <span className="text-gradient">Fucking</span>
                        <br />
                        <span style={{ color: 'var(--text-primary)' }}>Home</span>
                    </h1>
                    
                    <p style={{
                        fontSize: '1.2rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '1rem',
                        lineHeight: 1.6,
                        maxWidth: '600px',
                        margin: '0 auto 1rem auto'
                    }}>
                        Connect your MultiversX wallet to view your unique Perfect Fucking People NFTs.{' '}
                        {displayCount} items. 4 Seasons. 100% 1/1.
                    </p>
                </div>

                {carouselNfts.length > 0 && (
                    <div className="marquee-container" style={{ zIndex: 1 }}>
                        <div className="marquee-track">
                            {[...carouselNfts, ...carouselNfts].map((nft, idx) => {
                                const charName = nft.metadata?.attributes?.find(
                                    a => a.trait_type?.toLowerCase() === 'character'
                                )?.value || nft.name || 'P.F.P';
                                const match = nft.name.match(/\d+/);
                                const charId = match ? `#${match[0]}` : '';
                                const imageUrl = nft.url || nft.media?.[0]?.url || nft.media?.[0]?.thumbnailUrl;

                                return (
                                    <div key={`${nft.identifier}-${idx}`} className="marquee-card">
                                        <div className="marquee-image-wrapper">
                                            {imageUrl ? (
                                                <img 
                                                    src={imageUrl} 
                                                    alt={nft.name} 
                                                    className="marquee-image"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    N/A
                                                </div>
                                            )}
                                        </div>
                                        <div className="marquee-info">
                                            <div className="marquee-char-name">{String(charName)}</div>
                                            <div className="marquee-char-id">P.F.P Collection {charId}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '1rem',
                    marginTop: '1.5rem',
                    zIndex: 1,
                    padding: '0 2rem',
                    width: '100%'
                }}>
                    <ConnectButton />
                    
                    {/* Minimal Animated Arrow */}
                    <button 
                        onClick={handleScrollDown}
                        className="scroll-arrow-btn"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px',
                            outline: 'none',
                            marginTop: '1.5rem'
                        }}
                    >
                        <span style={{ 
                            fontSize: '0.8rem', 
                            letterSpacing: '2px', 
                            textTransform: 'uppercase', 
                            opacity: 0.6,
                            fontFamily: 'var(--font-display)',
                            fontWeight: 600
                        }}>
                            Discover More
                        </span>
                        <svg 
                            width="20" 
                            height="20" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="bounce-arrow"
                        >
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                </div>
                
                {/* Stats Footer (remains fixed at the bottom of the viewport) */}
                <div className="glass-panel" style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '3rem',
                    padding: '1rem 3rem',
                    borderRadius: '100px',
                    zIndex: 10
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {displayCount}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Items</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>4</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Seasons</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>1/1</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Uniqueness</div>
                    </div>
                </div>
            </section>

            {/* OOX Marketplace Banner Section */}
            <section 
                ref={bannerRef}
                style={{
                    minHeight: '75vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6rem 2rem',
                    position: 'relative',
                    background: 'linear-gradient(to bottom, #0a0a0f 0%, #0d061c 50%, #07030e 100%)',
                    overflow: 'hidden',
                    borderTop: '1px solid rgba(124, 58, 237, 0.15)'
                }}
            >
                {/* Visual Ambient Light */}
                <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '300px',
                    background: 'radial-gradient(ellipse, rgba(236, 72, 153, 0.06) 0%, rgba(10, 10, 15, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div className="banner-grid" style={{ maxWidth: '1000px', zIndex: 1 }}>
                    <div className="banner-content">
                        <div className="banner-subtitle">Collection Marketplace</div>
                        <h2 className="banner-title" style={{ fontWeight: 800 }}>
                            Get Your First <br />
                            <span className="text-gradient">Perfect Fucking People</span>
                        </h2>
                        <p className="banner-desc">
                            Own a piece of the most iconic MultiversX 1/1 collection. Explore the official secondary marketplace on OOX to purchase your first P.F.P and unlock the digital gallery of your wallet. <strong style={{ color: 'var(--text-primary)' }}>Entry price 25 USDC</strong>.
                        </p>
                        
                        <a 
                            href="https://oox.art/marketplace/collections/PFP-717e46"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary"
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                textDecoration: 'none',
                                padding: '14px 36px',
                                borderRadius: '12px',
                                fontSize: '1.05rem',
                                boxShadow: '0 8px 30px rgba(236, 72, 153, 0.3)'
                            }}
                        >
                            <span>Buy on OOX Marketplace</span>
                            <svg 
                                width="18" 
                                height="18" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </a>
                    </div>

                    <div>
                        {/* Premium 3D Card Display */}
                        <div className="banner-nft-card">
                            <img 
                                src={bannerNft ? (bannerNft.url || bannerNft.media?.[0]?.url || bannerNft.media?.[0]?.thumbnailUrl) : "/pfp_nft_banner_preview.png"} 
                                alt={bannerNft ? bannerNft.name : "PFP NFT Preview"} 
                                className="banner-nft-image"
                                style={{ objectFit: 'cover' }}
                                loading="lazy"
                            />
                            <div className="banner-nft-info">
                                <div>
                                    <div className="banner-nft-name">
                                        {bannerNft 
                                            ? (bannerNft.metadata?.attributes?.find(
                                                a => a.trait_type?.toLowerCase() === 'character'
                                              )?.value || bannerNft.name)
                                            : "PFP-717e46 #042"
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {bannerNft 
                                            ? `Perfect Fucking People ${bannerNft.name.match(/\d+/) ? `#${bannerNft.name.match(/\d+/)?.[0]}` : ''}`
                                            : "Perfect Fucking People"
                                        }
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="banner-nft-price">OOX.ART</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        Marketplace
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Collection Data Section */}
            <section 
                style={{
                    minHeight: '40vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6rem 2rem 12rem 2rem', // generous bottom padding because of fixed stats pill
                    background: 'linear-gradient(to bottom, #07030e 0%, #0a0a0f 100%)',
                    position: 'relative',
                    borderTop: '1px solid rgba(124, 58, 237, 0.1)'
                }}
            >
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    bottom: '0', left: '0',
                    width: '300px', height: '300px',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.05) 0%, rgba(10, 10, 15, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div style={{ textAlign: 'center', marginBottom: '3.5rem', zIndex: 1 }}>
                    <div className="banner-subtitle">On-Chain Analytics</div>
                    <h2 className="banner-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800 }}>
                        Collection <span className="text-gradient">Performance</span>
                    </h2>
                </div>

                <div 
                    className="stats-grid"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '2rem',
                        maxWidth: '1000px',
                        width: '100%',
                        zIndex: 1
                    }}
                >
                    {/* Floor Price Card */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper purple">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        </div>
                        <div className="stat-label">Floor Price</div>
                        <div className="stat-value">
                            {collectionStats.floorPrice !== null 
                                ? `${collectionStats.floorPrice.toFixed(2)} EGLD` 
                                : "—"
                            }
                        </div>
                        <div className="stat-sublabel">Lowest listing price on OOX</div>
                    </div>

                    {/* Holders Card */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper pink">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        </div>
                        <div className="stat-label">Unique Holders</div>
                        <div className="stat-value">
                            {collectionStats.holderCount !== null 
                                ? collectionStats.holderCount.toLocaleString() 
                                : "—"
                            }
                        </div>
                        <div className="stat-sublabel">Unique wallets holding NFTs</div>
                    </div>

                    {/* Listed Card */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper blue">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        </div>
                        <div className="stat-label">Listed Items</div>
                        <div className="stat-value">
                            {collectionStats.nftsListed !== null 
                                ? `${collectionStats.nftsListed} / 60` 
                                : "—"
                            }
                        </div>
                        <div className="stat-sublabel">
                            {collectionStats.nftsListed !== null 
                                ? `${((collectionStats.nftsListed / 60) * 100).toFixed(0)}% of supply listed` 
                                : "Listed on OOX"
                            }
                        </div>
                    </div>

                    {/* Total Volume Card */}
                    <div className="stat-card">
                        <div className="stat-icon-wrapper green">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        </div>
                        <div className="stat-label">Total Volume</div>
                        <div className="stat-value">
                            {collectionStats.totalVolume !== null 
                                ? `${collectionStats.totalVolume.toFixed(1)} EGLD` 
                                : "—"
                            }
                        </div>
                        <div className="stat-sublabel">Accumulated trading volume</div>
                    </div>
                </div>
            </section>
        </div>
    );
}
