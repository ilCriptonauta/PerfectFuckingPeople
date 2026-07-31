"use client";

import { useEffect, useState, useRef } from "react";
import { ConnectButton } from "./ConnectButton";
import { MultiversXNFT } from "@/types/nft.types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const shuffleArray = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export function HeroSection() {
    const searchParams = useSearchParams();
    const simulateAddress = searchParams.get("simulate");

    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [carouselNfts, setCarouselNfts] = useState<MultiversXNFT[]>([]);
    const [bannerNft, setBannerNft] = useState<MultiversXNFT | null>(null);
    const [loreNft, setLoreNft] = useState<MultiversXNFT | null>(null);
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
    
    const [isScrolled, setIsScrolled] = useState<boolean>(false);
    const bannerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 60) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

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
        fetch("https://api.multiversx.com/collections/PFP-717e46/nfts?size=500")
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) {
                    const shuffled = shuffleArray(data);
                    // Take 12 items for the carousel
                    setCarouselNfts(shuffled.slice(0, 12));
                    // Pick a random one for the banner card
                    setBannerNft(shuffled[12] || shuffled[0]);
                    // Pick another random one for the lore section card
                    setLoreNft(shuffled[13] || shuffled[1] || shuffled[0]);
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
                        <strong style={{ color: 'var(--accent-primary)' }}>{displayCount} items</strong>. <strong style={{ color: 'var(--accent-secondary)' }}>5 Seasons + Collectibles</strong>. <strong className="text-gradient" style={{ fontWeight: '800' }}>100% 1/1</strong>.
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
                                const imageUrl = nft.media?.[0]?.thumbnailUrl || nft.url || nft.media?.[0]?.url;

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
                
                {/* Stats Footer (disappears smoothly when scrolling down) */}
                <div className={`glass-panel fixed-stats-pill ${isScrolled ? 'scrolled-hidden' : ''}`}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                            {displayCount}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total Items</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>5 + 1</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Seasons</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>1/1</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Uniqueness</div>
                    </div>
                </div>
            </section>

            {/* Fucking Lore Section */}
            <section 
                style={{
                    minHeight: '75vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6rem 2rem',
                    position: 'relative',
                    background: 'linear-gradient(to bottom, #0a0a0f 0%, #060e17 50%, #0a0a0f 100%)',
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
                    background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.06) 0%, rgba(10, 10, 15, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />

                <div className="banner-grid swapped" style={{ maxWidth: '1000px', zIndex: 1 }}>
                    <div>
                        {/* Premium 3D Card Display */}
                        <div className="banner-nft-card" style={{ border: '1px solid rgba(124, 58, 237, 0.25)' }}>
                            <img 
                                src={loreNft ? (loreNft.url || loreNft.media?.[0]?.url || loreNft.media?.[0]?.thumbnailUrl) : "/pfp_nft_banner_preview.png"} 
                                alt={loreNft ? loreNft.name : "PFP NFT Preview"} 
                                className="banner-nft-image"
                                style={{ objectFit: 'cover' }}
                                loading="lazy"
                            />
                            <div className="banner-nft-info">
                                <div>
                                    <div className="banner-nft-name">
                                        {loreNft 
                                            ? (loreNft.metadata?.attributes?.find(
                                                a => a.trait_type?.toLowerCase() === 'character'
                                              )?.value || loreNft.name)
                                            : "PFP-717e46 #042"
                                        }
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        {loreNft 
                                            ? `Perfect Fucking People ${loreNft.name.match(/\d+/) ? `#${loreNft.name.match(/\d+/)?.[0]}` : ''}`
                                            : "Perfect Fucking People"
                                        }
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div className="banner-nft-price" style={{ color: 'var(--accent-primary)' }}>P.F.P LORE</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        Featured
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="banner-content">
                        <div className="banner-subtitle" style={{ color: 'var(--accent-primary)' }}>Project Lore</div>
                        <h2 className="banner-title" style={{ fontWeight: 800 }}>
                            Enter the <br />
                            <span className="text-gradient">Fucking World</span>
                        </h2>
                        <p className="banner-desc">
                            A simulated dimension of absolute perfection, held together by cold mainframe code. Discover the glitched history, unlikely guardians, and the rebels fighting to break free from their digital parameters.
                        </p>
                        
                        <Link 
                            href={simulateAddress ? `/gallery/lore?simulate=${simulateAddress}` : "/gallery/lore"}
                            className="btn-primary"
                            style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                textDecoration: 'none',
                                padding: '14px 36px',
                                borderRadius: '12px',
                                fontSize: '1.05rem',
                                boxShadow: '0 8px 30px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            <span>Read the Full Story</span>
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
                        </Link>
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
                            Own a piece of the most iconic MultiversX 1/1 collection. Explore the official secondary marketplace on OOX to purchase your P.F.P and unlock the digital gallery of your wallet. <strong style={{ color: 'var(--text-primary)' }}>Seasons 1-5 starting at 30 USDC, Collectibles at 25 USDC</strong>.
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

            {/* Ecosystem (Seasons vs Collectibles) Section */}
            <section 
                style={{
                    minHeight: '70vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6rem 2rem',
                    position: 'relative',
                    background: 'linear-gradient(to bottom, #07030e 0%, #0d061c 50%, #07030e 100%)',
                    overflow: 'hidden',
                    borderTop: '1px solid rgba(124, 58, 237, 0.1)'
                }}
            >
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    top: '20%', right: '10%',
                    width: '400px', height: '400px',
                    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, rgba(10, 10, 15, 0) 70%)',
                    borderRadius: '50%',
                    zIndex: 0,
                    pointerEvents: 'none'
                }} />
                
                <div style={{ textAlign: 'center', marginBottom: '4rem', zIndex: 1, maxWidth: '800px' }}>
                    <div className="banner-subtitle">Ecosystem Structure</div>
                    <h2 className="banner-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800 }}>
                        Seasons vs <span className="text-gradient">Collectibles</span>
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginTop: '12px', lineHeight: 1.6 }}>
                        Understanding the Perfect Fucking People lifecycle, distribution rules, and exclusive rewards.
                    </p>
                </div>

                <div className="ecosystem-grid" style={{ zIndex: 1 }}>
                    {/* Core Seasons Card */}
                    <div className="ecosystem-card core-seasons">
                        <div className="ecosystem-badge core">Seasons 1 - 5</div>
                        <h3 className="ecosystem-card-title">The Core Seasons</h3>
                        <p className="ecosystem-card-desc">
                            The original drops that built the project's foundation. Composed entirely of exclusive 1/1s with unique attributes, backgrounds, and storylines. Available on the market starting at 30 USDC.
                        </p>
                        <ul className="ecosystem-list">
                            <li><span>🛡️</span> <strong>Handcrafted 1/1s:</strong> Every single character is a completely unique digital work of art.</li>
                            <li><span>🔒</span> <strong>Collector's Keys:</strong> Purchasing a P.F.P from these seasons is the only way to gain membership.</li>
                            <li><span>👑</span> <strong>OG Privilege:</strong> Holding at least one core P.F.P instantly grants you the prestigious **OG Status**.</li>
                        </ul>
                    </div>

                    {/* Collectibles Card */}
                    <div className="ecosystem-card collectibles">
                        <div className="ecosystem-badge expansion">Expansion</div>
                        <h3 className="ecosystem-card-title">The Collectibles</h3>
                        <p className="ecosystem-card-desc">
                            An ongoing, wider collection of rare items and special editions. Available on the market starting at 25 USDC.
                        </p>
                        <ul className="ecosystem-list">
                            <li><span>🚀</span> <strong>Continuous Growth:</strong> New Collectibles are introduced dynamically as the universe expands.</li>
                            <li><span>💎</span> <strong>Unique Rarity:</strong> Feature ultra-rare attributes, special backgrounds, and distinct lore.</li>
                            <li><span>🎁</span> <strong>OG Perks:</strong> In addition to being listed on the market, one Collectible is gifted to an OG holder every month.</li>
                        </ul>
                    </div>
                </div>

                {/* Giveaway Explainer Panel */}
                <div className="ecosystem-giveaway-panel" style={{ zIndex: 1 }}>
                    <div className="giveaway-icon">🎁</div>
                    <div className="giveaway-content">
                        <h3 className="giveaway-title-main">Monthly OG Giveaways</h3>
                        <p className="giveaway-desc-main">
                            While Collectibles are available for purchase on the marketplace, **once a month** we run exclusive giveaways specifically for **OG holders** (those owning at least one NFT from Seasons 1-5). One Collectible NFT is sent directly to a randomly selected OG's wallet as a free gift. Become an OG today to join the cycle!
                        </p>
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
                                ? `${collectionStats.nftsListed} / ${totalItems || 89}` 
                                : "—"
                            }
                        </div>
                        <div className="stat-sublabel">
                            {collectionStats.nftsListed !== null 
                                ? `${((collectionStats.nftsListed / (totalItems || 89)) * 100).toFixed(0)}% of supply listed` 
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

                {/* Footer Section */}
                <footer style={{
                    marginTop: '5rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    width: '100%',
                    maxWidth: '1000px',
                    textAlign: 'center',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    zIndex: 1
                }}>
                    <p style={{ margin: 0 }}>
                        Perfect Fucking People is designed by{' '}
                        <a 
                            href="https://x.com/ilcriptonauta" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#8b5cf6', 
                                fontWeight: 700, 
                                textDecoration: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            ilCriptonauta
                        </a>
                        . Produced and distributed by{' '}
                        ✏️{' '}
                        <a 
                            href="https://x.com/unperfectstudio" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ 
                                color: '#ec4899', 
                                fontWeight: 700, 
                                textDecoration: 'none',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            Unperfect Studio
                        </a>
                        {' '}✏️
                    </p>
                </footer>
            </section>
        </div>
    );
}
