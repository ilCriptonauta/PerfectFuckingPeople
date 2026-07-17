"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn";
import { ConnectButton } from "@/components/ConnectButton";
import { useWalletNFTs } from "@/hooks/useWalletNFTs";
import { NFTGrid } from "@/components/NFTGrid";
import { NFTCarousel } from "@/components/NFTCarousel";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { MultiversXNFT } from "@/types/nft.types";

export default function GalleryPage() {
    const isLoggedIn = useGetIsLoggedIn();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    // Dev simulation mode: ?simulate=erd1...
    const simulateAddress = searchParams.get("simulate");
    const isSimulating = !!simulateAddress;

    const { nfts, isLoading, error, address } = useWalletNFTs(simulateAddress || undefined);
    const [selectedSeason, setSelectedSeason] = useState<string>("all");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<"grid" | "carousel" | "all">("grid");
    const [allCollectionNfts, setAllCollectionNfts] = useState<MultiversXNFT[]>([]);
    const [isAllNftsLoading, setIsAllNftsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const getNFTSeasonValue = (nft: MultiversXNFT): string => {
        const honoraryAttr = nft.metadata?.attributes?.find(
            (a) => a.trait_type?.toLowerCase() === "honorary"
        );
        if (honoraryAttr) {
            return "honorary";
        }

        const seasonAttr = nft.metadata?.attributes?.find(
            (a) => a.trait_type?.toLowerCase() === "season"
        );
        if (!seasonAttr) return "";
        const valStr = String(seasonAttr.value).trim().toLowerCase();
        if (valStr.includes("collectibles")) {
            return "collectibles";
        }
        const match = valStr.match(/\d+/);
        return match ? match[0] : "";
    };

    const isOriginalOG = !isLoading && nfts.some((nft: MultiversXNFT) => {
        const seasonVal = getNFTSeasonValue(nft);
        const seasonNum = parseInt(seasonVal, 10);
        return !isNaN(seasonNum) && seasonNum >= 1 && seasonNum <= 5;
    });

    const isCollector = !isLoading && nfts.some((nft: MultiversXNFT) => {
        return getNFTSeasonValue(nft) === "collectibles";
    });

    const isWhale = !isLoading && nfts.length > 10;

    const isSerialCollector = !isLoading && [1, 2, 3, 4, 5].every((s) => 
        nfts.some((nft) => {
            const seasonVal = getNFTSeasonValue(nft);
            const seasonNum = parseInt(seasonVal, 10);
            return !isNaN(seasonNum) && seasonNum === s;
        })
    );

    const isPerfectHolder = isOriginalOG && isCollector && isWhale && isSerialCollector;

    const unlockedCount = [isOriginalOG, isCollector, isWhale, isSerialCollector, isPerfectHolder].filter(Boolean).length;

    const filteredNfts = nfts.filter((nft: MultiversXNFT) => {
        if (selectedSeason === "all") return true;
        return getNFTSeasonValue(nft) === selectedSeason;
    });

    const filteredAllNfts = allCollectionNfts.filter((nft: MultiversXNFT) => {
        if (selectedSeason === "all") return true;
        return getNFTSeasonValue(nft) === selectedSeason;
    });

    useEffect(() => {
        setMounted(true);
        
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const handleDocumentClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (target.closest('.nft-card-perspective')) {
                return;
            }
            setFlippedCardId(null);
        };
        
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("click", handleDocumentClick);

        // Fetch all collection NFTs
        setIsAllNftsLoading(true);
        fetch("https://api.multiversx.com/collections/PFP-717e46/nfts?size=100")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllCollectionNfts(data);
                }
            })
            .catch(err => console.error("Error fetching all NFTs:", err))
            .finally(() => setIsAllNftsLoading(false));

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("click", handleDocumentClick);
        };
    }, []);

    useEffect(() => {
        // Don't redirect if simulating
        if (mounted && !isLoggedIn && !isSimulating) {
            window.location.href = "/";
        }
    }, [isLoggedIn, mounted, isSimulating]);

    if (!mounted || (!isLoggedIn && !isSimulating)) {
        return null;
    }

    const displayAddress = simulateAddress || address;
    const shortAddress = displayAddress
        ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
        : "";

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--border)'
            }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span className="text-gradient">My</span> Fucking People
                </h1>
                {isSimulating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: 'rgba(251, 191, 36, 0.15)',
                            color: '#fbbf24',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            ⚡ Simulation Mode
                        </div>
                        <div className="glass-panel" style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            color: 'var(--accent-secondary)'
                        }}>
                            {shortAddress}
                        </div>
                    </div>
                ) : (
                    <ConnectButton />
                )}
            </header>

            <main style={{ marginTop: '3rem' }}>
                <div className="gallery-banner-row">
                    {/* Left Card: Badges Card */}
                    <Link 
                        href={isSimulating ? `/gallery/badges?simulate=${simulateAddress}` : "/gallery/badges"} 
                        className="badges-card"
                    >
                        <div className="badges-card-badge">
                            🏅
                        </div>
                        <div className="badges-card-content">
                            <div className="badges-card-title">
                                My Badges
                            </div>
                            <div className="badges-card-desc">
                                {isLoading 
                                    ? "Loading achievements..." 
                                    : `You have unlocked ${unlockedCount} of 5 achievements. Click to view them.`
                                }
                            </div>
                        </div>
                        <div className="badges-card-arrow">
                            →
                        </div>
                    </Link>

                    {/* Right Card: Leaderboard CTA */}
                    <Link href={isSimulating ? `/gallery/leaderboard?simulate=${simulateAddress}` : "/gallery/leaderboard"} className="leaderboard-card">
                        <div className="leaderboard-card-badge">
                            👑
                        </div>
                        <div className="leaderboard-card-content">
                            <div className="leaderboard-card-title">
                                Holders Leaderboard
                            </div>
                            <div className="leaderboard-card-desc">
                                View the top collectors and active holders of the P.F.P collection.
                            </div>
                        </div>
                        <div className="leaderboard-card-arrow">
                            →
                        </div>
                    </Link>
                </div>

                <div 
                    ref={dropdownRef}
                    className={`custom-dropdown-container ${isDropdownOpen ? 'open' : ''}`}
                >
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="custom-dropdown-trigger"
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className={`dropdown-badge-dot ${
                                selectedSeason === "all" ? "badge-all" :
                                selectedSeason === "collectibles" ? "badge-collectibles" :
                                selectedSeason === "honorary" ? "badge-honorary" :
                                `badge-${selectedSeason}`
                            }`} />
                            {selectedSeason === "all" ? "All Perfect People" :
                             selectedSeason === "collectibles" ? "Collectibles" :
                             selectedSeason === "honorary" ? "Honorary" :
                             `Season ${selectedSeason}`}
                        </span>
                        <span className="custom-dropdown-arrow">▼</span>
                    </button>
                    <div className="custom-dropdown-menu">
                        {[
                            { id: "all", label: "All Perfect People", badgeClass: "badge-all" },
                            { id: "1", label: "Season 1", badgeClass: "badge-1" },
                            { id: "2", label: "Season 2", badgeClass: "badge-2" },
                            { id: "3", label: "Season 3", badgeClass: "badge-3" },
                            { id: "4", label: "Season 4", badgeClass: "badge-4" },
                            { id: "5", label: "Season 5", badgeClass: "badge-5" },
                            { id: "collectibles", label: "Collectibles", badgeClass: "badge-collectibles" },
                            { id: "honorary", label: "Honorary", badgeClass: "badge-honorary" }
                        ].map((season) => (
                            <button
                                key={season.id}
                                onClick={() => {
                                    setSelectedSeason(season.id);
                                    setIsDropdownOpen(false);
                                }}
                                className={`custom-dropdown-item item-${season.id} ${selectedSeason === season.id ? `active-${season.id}` : ''}`}
                            >
                                <span className={`dropdown-badge-dot ${season.badgeClass}`} />
                                {season.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Mode Tabs */}
                <div className="view-mode-tabs">
                    <button 
                        className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                        onClick={() => setViewMode("grid")}
                        title="Grid View"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        <span>Grid</span>
                    </button>
                    <button 
                        className={`view-mode-btn ${viewMode === "carousel" ? "active" : ""}`}
                        onClick={() => setViewMode("carousel")}
                        title="Carousel View"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
                        <span>Carousel</span>
                    </button>
                    <button 
                        className={`view-mode-btn ${viewMode === "all" ? "active" : ""}`}
                        onClick={() => setViewMode("all")}
                        title="All Collection"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <span>All Collection</span>
                    </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                        {viewMode === "all" ? "Complete Collection" : "Your Collection"}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {viewMode === "all" ? (
                            selectedSeason === "all" ? (
                                <>
                                    Showing all <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{allCollectionNfts.length}</span> Perfect Fucking People in the collection
                                </>
                            ) : (
                                <>
                                    Showing <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{filteredAllNfts.length}</span> of {allCollectionNfts.length} Perfect Fucking People ({selectedSeason === "collectibles" ? "Collectibles" : `Season ${selectedSeason}`})
                                </>
                            )
                        ) : (
                            selectedSeason === "all" ? (
                                <>
                                    You own <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{nfts.length}</span> Perfect Fucking People
                                </>
                            ) : (
                                <>
                                    Showing <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{filteredNfts.length}</span> of {nfts.length} Perfect Fucking People ({selectedSeason === "collectibles" ? "Collectibles" : `Season ${selectedSeason}`})
                                </>
                            )
                        )}
                    </p>
                </div>

                {((isLoading && viewMode !== "all") || (isAllNftsLoading && viewMode === "all")) && <LoadingSkeleton />}
                
                {error && (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ff4d4d' }}>
                        <p>Error loading NFTs: {error}</p>
                    </div>
                )}
                
                {!error && (
                    <>
                        {/* Grid View */}
                        {viewMode === "grid" && !isLoading && (
                            <NFTGrid 
                                nfts={filteredNfts} 
                                flippedCardId={flippedCardId}
                                onFlip={(id) => setFlippedCardId(prev => prev === id ? null : id)}
                            />
                        )}

                        {/* Carousel View */}
                        {viewMode === "carousel" && !isLoading && (
                            <NFTCarousel 
                                nfts={filteredNfts} 
                                flippedCardId={flippedCardId}
                                onFlip={(id) => setFlippedCardId(prev => prev === id ? null : id)}
                            />
                        )}

                        {/* All Collection View */}
                        {viewMode === "all" && !isAllNftsLoading && (
                            <NFTGrid 
                                nfts={filteredAllNfts} 
                                ownedNfts={nfts}
                                flippedCardId={flippedCardId}
                                onFlip={(id) => setFlippedCardId(prev => prev === id ? null : id)}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
