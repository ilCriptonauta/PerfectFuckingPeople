"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn";
import { ConnectButton } from "@/components/ConnectButton";
import { useWalletNFTs } from "@/hooks/useWalletNFTs";
import { NFTGrid } from "@/components/NFTGrid";
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

    const getNFTSeasonNumber = (nft: MultiversXNFT): number => {
        const seasonAttr = nft.metadata?.attributes?.find(
            (a) => a.trait_type?.toLowerCase() === "season"
        );
        if (!seasonAttr) return 0;
        const valStr = String(seasonAttr.value);
        const match = valStr.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    };

    const isOG = !isLoading && nfts.some((nft: MultiversXNFT) => {
        const seasonNum = getNFTSeasonNumber(nft);
        return seasonNum >= 1 && seasonNum <= 5;
    });

    const filteredNfts = nfts.filter((nft: MultiversXNFT) => {
        if (selectedSeason === "all") return true;
        const seasonNum = getNFTSeasonNumber(nft);
        return String(seasonNum) === selectedSeason;
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Don't redirect if simulating
        if (mounted && !isLoggedIn && !isSimulating) {
            router.push("/");
        }
    }, [isLoggedIn, router, mounted, isSimulating]);

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
                    {/* Left Card: OG Status */}
                    <div className={`og-status-card ${!isOG ? 'inactive' : ''}`}>
                        <div className={`og-badge ${!isOG ? 'inactive' : ''}`} style={{ cursor: 'default', animation: 'none' }}>
                            <span className="og-badge-star">★</span> {isOG ? 'P.F.P OG' : 'OG Locked'}
                        </div>
                        <div className="og-status-banner-content">
                            <div className="og-status-banner-title">
                                {isOG ? 'OG Status Active' : 'OG Status Inactive'}
                            </div>
                            <div className="og-status-banner-desc">
                                {isOG 
                                    ? 'As a holder of at least one P.F.P from Seasons 1-5, you have unlocked the OG role!'
                                    : 'Hold at least one P.F.P from Seasons 1-5 to unlock the exclusive OG role!'
                                }
                            </div>
                        </div>
                    </div>

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

                <div className="season-tabs-container">
                    <button 
                        onClick={() => setSelectedSeason("all")} 
                        className={`season-tab ${selectedSeason === "all" ? "active-all" : ""}`}
                    >
                        All
                    </button>
                    {[1, 2, 3, 4, 5].map((season) => (
                        <button
                            key={season}
                            onClick={() => setSelectedSeason(String(season))}
                            className={`season-tab ${selectedSeason === String(season) ? `active-${season}` : ""}`}
                        >
                            Season {season}
                        </button>
                    ))}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Your Collection</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        {selectedSeason === "all" ? (
                            <>
                                You own <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{nfts.length}</span> Perfect Fucking People
                            </>
                        ) : (
                            <>
                                Showing <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>{filteredNfts.length}</span> of {nfts.length} Perfect Fucking People (Season {selectedSeason})
                            </>
                        )}
                    </p>
                </div>

                {isLoading && <LoadingSkeleton />}
                
                {error && (
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#ff4d4d' }}>
                        <p>Error loading NFTs: {error}</p>
                    </div>
                )}
                
                {!isLoading && !error && <NFTGrid nfts={filteredNfts} />}
            </main>
        </div>
    );
}
