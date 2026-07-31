"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWalletNFTs } from "@/hooks/useWalletNFTs";
import { MultiversXNFT } from "@/types/nft.types";

function ProfileContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);

    const simulateAddress = searchParams.get("simulate");
    const isSimulating = !!simulateAddress;

    const { nfts, isLoading, error, address } = useWalletNFTs(simulateAddress || undefined);
    
    const [herotag, setHerotag] = useState<string | null>(null);
    const [isFetchingAccount, setIsFetchingAccount] = useState<boolean>(false);

    const carouselRef = useRef<HTMLDivElement>(null);

    const displayAddress = simulateAddress || address;
    const shortAddress = displayAddress
        ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
        : "";

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch Herotag (username) from MultiversX Account API
    useEffect(() => {
        if (!displayAddress) {
            setHerotag(null);
            return;
        }

        setIsFetchingAccount(true);
        fetch(`https://api.multiversx.com/accounts/${displayAddress}`)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.username) {
                    // Clean up username string (e.g. "francesco.elrond" -> "francesco")
                    const cleanName = String(data.username).replace(/\.elrond$/, "");
                    setHerotag(cleanName);
                } else {
                    setHerotag(null);
                }
            })
            .catch((err) => {
                console.error("Error fetching account herotag:", err);
                setHerotag(null);
            })
            .finally(() => {
                setIsFetchingAccount(false);
            });
    }, [displayAddress]);

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

    // Determine seasons held and OG counts
    const heldSeasons = new Set<number>();
    let hasCollectibles = false;
    let hasHonorary = false;
    let honoraryNames: string[] = [];
    let ogTickets = 0;

    nfts.forEach((nft) => {
        const honoraryAttr = nft.metadata?.attributes?.find(
            (a) => a.trait_type?.toLowerCase() === "honorary"
        );
        if (honoraryAttr && honoraryAttr.value) {
            hasHonorary = true;
            honoraryNames.push(String(honoraryAttr.value));
        }

        const sVal = getNFTSeasonValue(nft);
        if (sVal === "collectibles") {
            hasCollectibles = true;
        } else {
            const num = parseInt(sVal, 10);
            if (!isNaN(num) && num >= 1 && num <= 5) {
                heldSeasons.add(num);
                ogTickets++;
            }
        }
    });

    const isOG = heldSeasons.size > 0;
    const isCollector = hasCollectibles;
    const isWhale = nfts.length > 10;
    const isSerialCollector = [1, 2, 3, 4, 5].every((s) => heldSeasons.has(s));
    const isHonorary = hasHonorary;
    const isPerfectHolder = isOG && isCollector && isWhale && isSerialCollector;

    const unlockedCount = [isOG, isCollector, isWhale, isSerialCollector, isHonorary, isPerfectHolder].filter(Boolean).length;
    const progressPercent = (unlockedCount / 6) * 100;

    // Calculate Giveaway Odds (Total OG Tickets in circulation = 89)
    const TOTAL_OG_TICKETS = 89;
    const winningOdds = ogTickets > 0 ? ((ogTickets / TOTAL_OG_TICKETS) * 100).toFixed(2) : "0.00";

    // Determine Welcome Name:
    // 1. Herotag if available (e.g. "@francesco")
    // 2. Otherwise Character trait of 1st owned NFT (e.g. "The Bear")
    // 3. Fallback to short address or "PFP Collector"
    let welcomeName = "PFP Collector";
    if (herotag) {
        welcomeName = `@${herotag}`;
    } else if (nfts.length > 0) {
        const firstNft = nfts[0];
        const charAttr = firstNft.metadata?.attributes?.find(
            (a) => a.trait_type?.toLowerCase() === "character"
        );
        if (charAttr && charAttr.value) {
            welcomeName = String(charAttr.value);
        } else if (firstNft.name) {
            welcomeName = firstNft.name;
        }
    } else if (shortAddress) {
        welcomeName = shortAddress;
    }

    const scrollCarousel = (direction: "left" | "right") => {
        if (carouselRef.current) {
            const scrollAmount = direction === "left" ? -340 : 340;
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <div className="profile-container">
            <Link 
                href={isSimulating ? `/gallery?simulate=${simulateAddress}` : "/gallery"} 
                className="back-link"
            >
                ← Back to Gallery
            </Link>

            <header className="profile-header-bar">
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <span className="text-gradient">My Fucking</span> Profile
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

            {isLoading || isFetchingAccount ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginTop: '2rem' }}>
                    <div className="profile-top-grid">
                        <div className="profile-panel-skeleton" />
                        <div className="profile-panel-skeleton" />
                    </div>
                </div>
            ) : error ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#ff4d4d', marginTop: '2rem' }}>
                    <h3>Error loading profile</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>{error}</p>
                </div>
            ) : !displayAddress ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                    <h3>Wallet not connected</h3>
                    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
                        Please connect your MultiversX wallet to view your profile.
                    </p>
                </div>
            ) : (
                <div className="profile-main-layout">
                    {/* Top 2-Column Grid: Welcome Panel + Vault Box */}
                    <div className="profile-top-grid">
                        {/* Left Column: Welcome Greeting */}
                        <div className="profile-welcome-panel glass-panel">
                            <div className="profile-avatar-badge">
                                ⚡
                            </div>
                            <div className="profile-welcome-info">
                                <span className="profile-welcome-subtitle">Welcome Back</span>
                                <h2 className="profile-welcome-title">
                                    {welcomeName}
                                </h2>
                                <p className="profile-welcome-address">
                                    Wallet: <code>{displayAddress}</code>
                                </p>
                                <div className="profile-welcome-tags">
                                    <span className="profile-tag purple">
                                        🖼️ {nfts.length} NFTs Held
                                    </span>
                                    <span className="profile-tag pink">
                                        🎟️ {ogTickets} OG Raffle Tickets
                                    </span>
                                    <span className="profile-tag green">
                                        🏅 {unlockedCount}/5 Badges
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Vault / Secret Unreleased NFT Teaser Box */}
                        <div className="profile-vault-panel glass-panel">
                            <div className="vault-header">
                                <div className="vault-icon-badge">🗝️</div>
                                <div>
                                    <div className="vault-subtitle">Secret Vault Drop</div>
                                    <h3 className="vault-title">Upcoming Exclusive NFT</h3>
                                </div>
                            </div>
                            <div className="vault-teaser-frame">
                                <div className="vault-lock-overlay">
                                    <div className="vault-lock-icon">🔒</div>
                                    <div className="vault-lock-text">RESERVED FOR HOLDERS</div>
                                    <div className="vault-lock-subtext">Unreleased Drop Coming Soon</div>
                                </div>
                            </div>
                            <p className="vault-caption">
                                A special unreleased NFT will be distributed to eligible holders soon. Keep holding!
                            </p>
                        </div>
                    </div>

                    {/* Section 2: Giveaway Winning Odds Calculator */}
                    <div className="profile-giveaway-section glass-panel">
                        <div className="giveaway-section-header">
                            <div>
                                <h3 className="giveaway-section-title">🎁 Monthly OG Giveaway Odds</h3>
                                <p className="giveaway-section-desc">
                                    Each Season 1-5 NFT you hold grants 1 Raffle Ticket in the monthly draw.
                                </p>
                            </div>
                        </div>

                        <div className="giveaway-odds-grid">
                            <div className="giveaway-stat-box">
                                <div className="stat-box-label">Your OG NFTs (Tickets)</div>
                                <div className="stat-box-value pink">{ogTickets}</div>
                                <div className="stat-box-sub">Season 1-5 drawings held</div>
                            </div>
                            <div className="giveaway-stat-box">
                                <div className="stat-box-label">Total Raffle Pool</div>
                                <div className="stat-box-value">{TOTAL_OG_TICKETS}</div>
                                <div className="stat-box-sub">Total OG tickets in circulation</div>
                            </div>
                            <div className="giveaway-stat-box highlight">
                                <div className="stat-box-label">Your Winning Chance</div>
                                <div className="stat-box-value gradient">{winningOdds}%</div>
                                <div className="stat-box-sub">Probability per monthly draw</div>
                            </div>
                        </div>

                        <div className="giveaway-odds-footer">
                            {ogTickets > 0 ? (
                                <span style={{ color: '#10b981', fontWeight: 600 }}>
                                    ✅ You hold {ogTickets} raffle tickets for the next monthly OG giveaway draw!
                                </span>
                            ) : (
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    💡 You hold 0 OG NFTs. Acquire at least 1 Season 1-5 NFT to unlock raffle tickets!
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Section 3: Badges Carousel */}
                    <div className="profile-badges-section">
                        <div className="badges-section-header">
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                                    🏅 My Achievements & Badges
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
                                    Unlocked {unlockedCount} of 6 badges
                                </p>
                            </div>

                            {/* Carousel Controls */}
                            <div className="carousel-nav-buttons">
                                <button onClick={() => scrollCarousel("left")} className="carousel-btn" aria-label="Previous Badges">
                                    ←
                                </button>
                                <button onClick={() => scrollCarousel("right")} className="carousel-btn" aria-label="Next Badges">
                                    →
                                </button>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="badge-progress-card" style={{ marginBottom: '1.5rem' }}>
                            <div className="badge-progress-header">
                                <span className="badge-progress-title">Overall Progress</span>
                                <span className="badge-progress-stats">{unlockedCount} / 6 Unlocked ({progressPercent.toFixed(0)}%)</span>
                            </div>
                            <div className="badge-progress-bar-bg">
                                <div 
                                    className="badge-progress-bar-fill" 
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        {/* Badges Carousel Track */}
                        <div className="badges-carousel-container" ref={carouselRef}>
                            <div className="badges-carousel-track">
                                {/* 1. P.F.P OG */}
                                <div className={`badge-detail-card carousel-badge-card ${isOG ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        ★
                                        {!isOG && <div className="badge-detail-card-lock">🔒</div>}
                                    </div>
                                    <h3 className="badge-detail-card-title">P.F.P OG</h3>
                                    <p className="badge-detail-card-desc">
                                        Awarded to original supporters. You hold at least one drawing from Seasons 1-5.
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
                                <div className={`badge-detail-card carousel-badge-card ${isCollector ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        🏆
                                        {!isCollector && <div className="badge-detail-card-lock">🔒</div>}
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
                                <div className={`badge-detail-card carousel-badge-card ${isWhale ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        🐋
                                        {!isWhale && <div className="badge-detail-card-lock">🔒</div>}
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
                                <div className={`badge-detail-card carousel-badge-card ${isSerialCollector ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        👑
                                        {!isSerialCollector && <div className="badge-detail-card-lock">🔒</div>}
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

                                {/* 5. Honorary */}
                                <div className={`badge-detail-card carousel-badge-card ${isHonorary ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        🎖️
                                        {!isHonorary && <div className="badge-detail-card-lock">🔒</div>}
                                    </div>
                                    <h3 className="badge-detail-card-title">Honorary</h3>
                                    <p className="badge-detail-card-desc">
                                        Awarded to holders of a special Honorary NFT tribute in the Perfect Fucking People universe.
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                        <strong>Requirement:</strong> Hold ≥ 1 Honorary NFT
                                        <div style={{ marginTop: '6px', color: isHonorary ? '#10b981' : 'var(--text-secondary)' }}>
                                            {isHonorary 
                                                ? `✅ Honorary NFT found: ${honoraryNames.join(', ')}` 
                                                : "❌ No Honorary NFTs found in wallet"
                                            }
                                        </div>
                                    </div>
                                    <span className="badge-detail-card-status-badge">
                                        {isHonorary ? "Unlocked" : "Locked"}
                                    </span>
                                </div>

                                {/* 5. Perfect Fucking Holder */}
                                <div className={`badge-detail-card carousel-badge-card ${isPerfectHolder ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        💎
                                        {!isPerfectHolder && <div className="badge-detail-card-lock">🔒</div>}
                                    </div>
                                    <h3 className="badge-detail-card-title">Perfect Fucking Holder</h3>
                                    <p className="badge-detail-card-desc">
                                        The ultimate badge of honor for absolute collectors. Unlocked by holding all other badges.
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="profile-container">
                <header style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem' }}><span className="text-gradient">My Fucking</span> Profile</h1>
                </header>
                <div style={{ height: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', animation: 'pulse 1.5s infinite ease-in-out' }} />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
