"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWalletNFTs } from "@/hooks/useWalletNFTs";
import { MultiversXNFT } from "@/types/nft.types";

function BadgesContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const simulateAddress = searchParams.get("simulate");
    const isSimulating = !!simulateAddress;

    const { nfts, isLoading, error, address } = useWalletNFTs(simulateAddress || undefined);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    if (!mounted) {
        return null;
    }

    // Determine seasons held
    const heldSeasons = new Set<number>();
    let hasCollectibles = false;

    nfts.forEach((nft) => {
        const sVal = getNFTSeasonValue(nft);
        if (sVal === "collectibles") {
            hasCollectibles = true;
        } else {
            const num = parseInt(sVal, 10);
            if (!isNaN(num) && num >= 1 && num <= 5) {
                heldSeasons.add(num);
            }
        }
    });

    const isOG = heldSeasons.size > 0;
    const isCollector = hasCollectibles;
    const isWhale = nfts.length > 10;
    const isSerialCollector = [1, 2, 3, 4, 5].every((s) => heldSeasons.has(s));
    const isPerfectHolder = isOG && isCollector && isWhale && isSerialCollector;

    const unlockedCount = [isOG, isCollector, isWhale, isSerialCollector, isPerfectHolder].filter(Boolean).length;
    const progressPercent = (unlockedCount / 5) * 100;

    const displayAddress = simulateAddress || address;
    const shortAddress = displayAddress
        ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
        : "";

    return (
        <div className="badges-container">
            <Link 
                href={isSimulating ? `/gallery?simulate=${simulateAddress}` : "/gallery"} 
                className="back-link"
            >
                ← Back to Gallery
            </Link>

            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '2rem'
            }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="text-gradient">My</span> Badges
                </h1>
                {isSimulating && (
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
                            ⚡ Simulation
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
                )}
            </header>

            {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Progress Card Skeleton */}
                    <div className="badge-progress-card" style={{ opacity: 0.6, animation: 'pulse 1.5s infinite ease-in-out' }}>
                        <div style={{ height: '24px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                        <div style={{ height: '10px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }} />
                    </div>
                    {/* Grid Skeleton */}
                    <div className="badges-grid">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="badge-detail-card locked" style={{ height: '300px', opacity: 0.5, animation: 'pulse 1.5s infinite ease-in-out' }}>
                                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', marginBottom: '20px' }} />
                                <div style={{ height: '20px', width: '60%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px' }} />
                                <div style={{ height: '40px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '20px' }} />
                                <div style={{ height: '24px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }} />
                            </div>
                        ))}
                    </div>
                    <style>{`
                        @keyframes pulse {
                            0% { opacity: 0.6; }
                            50% { opacity: 0.3; }
                            100% { opacity: 0.6; }
                        }
                    `}</style>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#ff4d4d' }}>
                    <h3>Error loading badges</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{error}</p>
                </div>
            ) : !displayAddress ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                    <h3>Wallet not connected</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Please connect your MultiversX wallet to view your badges.
                    </p>
                </div>
            ) : (
                <>
                    {/* Progress Summary Card */}
                    <div className="badge-progress-card">
                        <div className="badge-progress-header">
                            <span className="badge-progress-title">Achievements Progress</span>
                            <span className="badge-progress-stats">{unlockedCount} / 5 Unlocked</span>
                        </div>
                        <div className="badge-progress-bar-bg">
                            <div 
                                className="badge-progress-bar-fill" 
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Badges Cards Grid */}
                    <div className="badges-grid">
                        {/* 1. P.F.P OG */}
                        <div className={`badge-detail-card ${isOG ? 'unlocked' : 'locked'}`}>
                            <div className="badge-detail-card-icon">
                                ★
                                {!isOG && (
                                    <div className="badge-detail-card-lock">🔒</div>
                                )}
                            </div>
                            <h3 className="badge-detail-card-title">P.F.P OG</h3>
                            <p className="badge-detail-card-desc">
                                Awarded to the original supporters. You hold at least one drawing from Seasons 1-5.
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                <strong>Requirement:</strong> Hold ≥ 1 Season 1-5 NFT
                                <div style={{ marginTop: '6px', color: isOG ? '#10b981' : 'var(--text-secondary)' }}>
                                    {isOG 
                                        ? `✅ Season(s) held: ${Array.from(heldSeasons).sort().map(s => `S${s}`).join(', ')}` 
                                        : "❌ No Season 1-5 NFTs found"
                                    }
                                </div>
                            </div>
                            <span className="badge-detail-card-status-badge">
                                {isOG ? "Unlocked" : "Locked"}
                            </span>
                        </div>

                        {/* 2. Collector */}
                        <div className={`badge-detail-card ${isCollector ? 'unlocked' : 'locked'}`}>
                            <div className="badge-detail-card-icon">
                                🏆
                                {!isCollector && (
                                    <div className="badge-detail-card-lock">🔒</div>
                                )}
                            </div>
                            <h3 className="badge-detail-card-title">Collector</h3>
                            <p className="badge-detail-card-desc">
                                Awarded to holders of Season 6 Collectibles. You appreciate the latest additions!
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                <strong>Requirement:</strong> Hold ≥ 1 Collectible (S6) NFT
                                <div style={{ marginTop: '6px', color: isCollector ? '#10b981' : 'var(--text-secondary)' }}>
                                    {isCollector ? "✅ Season 6 Collectibles found" : "❌ No Season 6 NFTs found"}
                                </div>
                            </div>
                            <span className="badge-detail-card-status-badge">
                                {isCollector ? "Unlocked" : "Locked"}
                            </span>
                        </div>

                        {/* 3. Whale */}
                        <div className={`badge-detail-card ${isWhale ? 'unlocked' : 'locked'}`}>
                            <div className="badge-detail-card-icon">
                                🐋
                                {!isWhale && (
                                    <div className="badge-detail-card-lock">🔒</div>
                                )}
                            </div>
                            <h3 className="badge-detail-card-title">Whale</h3>
                            <p className="badge-detail-card-desc">
                                A major collector in the P.F.P ecosystem! Awarded for holding more than 10 NFTs.
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                <strong>Requirement:</strong> Hold &gt; 10 NFTs
                                <div style={{ marginTop: '6px', color: isWhale ? '#10b981' : 'var(--text-secondary)' }}>
                                    {isWhale 
                                        ? `✅ Success (${nfts.length} held)` 
                                        : `❌ Progress: ${nfts.length} / 11 held`
                                    }
                                </div>
                            </div>
                            <span className="badge-detail-card-status-badge">
                                {isWhale ? "Unlocked" : "Locked"}
                            </span>
                        </div>

                        {/* 4. Serial Collector */}
                        <div className={`badge-detail-card ${isSerialCollector ? 'unlocked' : 'locked'}`}>
                            <div className="badge-detail-card-icon">
                                👑
                                {!isSerialCollector && (
                                    <div className="badge-detail-card-lock">🔒</div>
                                )}
                            </div>
                            <h3 className="badge-detail-card-title">Serial Collector</h3>
                            <p className="badge-detail-card-desc">
                                The ultimate collector badge. You hold at least one drawing from every season from 1 to 5.
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                <strong>Requirement:</strong> Hold S1, S2, S3, S4, and S5
                                <div style={{ 
                                    display: 'flex', 
                                    flexWrap: 'wrap', 
                                    gap: '6px', 
                                    marginTop: '6px' 
                                }}>
                                    {[1, 2, 3, 4, 5].map((s) => {
                                        const hasIt = heldSeasons.has(s);
                                        return (
                                            <span 
                                                key={s} 
                                                style={{
                                                    padding: '2px 6px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    background: hasIt ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.03)',
                                                    color: hasIt ? '#10b981' : '#666',
                                                    border: `1px solid ${hasIt ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.05)'}`
                                                }}
                                            >
                                                S{s} {hasIt ? "✓" : "✗"}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                            <span className="badge-detail-card-status-badge">
                                {isSerialCollector ? "Unlocked" : "Locked"}
                            </span>
                        </div>

                        {/* 5. Perfect Fucking Holder */}
                        <div className={`badge-detail-card ${isPerfectHolder ? 'unlocked' : 'locked'}`}>
                            <div className="badge-detail-card-icon">
                                💎
                                {!isPerfectHolder && (
                                    <div className="badge-detail-card-lock">🔒</div>
                                )}
                            </div>
                            <h3 className="badge-detail-card-title">Perfect Fucking Holder</h3>
                            <p className="badge-detail-card-desc">
                                The ultimate badge of honor for the absolute collectors. Unlocked only by holding all other badges.
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                <strong>Requirement:</strong> Unlock all other 4 badges
                                <div style={{ marginTop: '6px', color: isPerfectHolder ? '#10b981' : 'var(--text-secondary)' }}>
                                    {isPerfectHolder 
                                        ? "✅ You are a Perfect Fucking Holder!" 
                                        : `❌ Progress: ${[isOG, isCollector, isWhale, isSerialCollector].filter(Boolean).length} / 4 badges unlocked`
                                    }
                                </div>
                            </div>
                            <span className="badge-detail-card-status-badge">
                                {isPerfectHolder ? "Unlocked" : "Locked"}
                            </span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function BadgesPage() {
    return (
        <Suspense fallback={
            <div className="badges-container">
                <header style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem' }}><span className="text-gradient">My</span> Badges</h1>
                </header>
                <div style={{ height: '100px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
        }>
            <BadgesContent />
        </Suspense>
    );
}
