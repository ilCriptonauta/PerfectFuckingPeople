"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWalletNFTs } from "@/hooks/useWalletNFTs";
import { useNFTHoldingTimes } from "@/hooks/useNFTHoldingTimes";
import { MultiversXNFT } from "@/types/nft.types";
import { getHoodTycoonStats, getRankInfo, HoodTycoonCareerStats } from "@/utils/hoodTycoonStats";

function ProfileContent() {
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState<'holder' | 'hood_tycoon'>('holder');

    const simulateAddress = searchParams.get("simulate");
    const isSimulating = !!simulateAddress;

    const { nfts, isLoading, error, address } = useWalletNFTs(simulateAddress || undefined);
    
    const [herotag, setHerotag] = useState<string | null>(null);
    const [isFetchingAccount, setIsFetchingAccount] = useState<boolean>(false);

    const [userAvatar, setUserAvatar] = useState<{ identifier: string; character: string; imageUrl: string } | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const hoodCarouselRef = useRef<HTMLDivElement>(null);

    const displayAddress = simulateAddress || address;
    const shortAddress = displayAddress
        ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}`
        : "";

    const { holdingTimes } = useNFTHoldingTimes(nfts, displayAddress);
    const [hoodStats, setHoodStats] = useState<HoodTycoonCareerStats>(() => getHoodTycoonStats(displayAddress));

    useEffect(() => {
        if (displayAddress) {
            queueMicrotask(() => {
                setHoodStats(getHoodTycoonStats(displayAddress));
            });
        }
    }, [displayAddress]);

    useEffect(() => {
        const handleStatsUpdated = (e: CustomEvent<HoodTycoonCareerStats>) => {
            if (e.detail) {
                setHoodStats(e.detail);
            }
        };
        window.addEventListener('hood_tycoon_stats_updated', handleStatsUpdated as EventListener);
        return () => window.removeEventListener('hood_tycoon_stats_updated', handleStatsUpdated as EventListener);
    }, [displayAddress]);

    useEffect(() => {
        queueMicrotask(() => setMounted(true));
    }, []);

    useEffect(() => {
        const loadAvatar = () => {
            try {
                const stored = localStorage.getItem("pfp_user_avatar");
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.imageUrl) {
                        setUserAvatar(parsed);
                        return;
                    }
                }
                setUserAvatar(null);
            } catch {
                setUserAvatar(null);
            }
        };

        loadAvatar();
        if (typeof window !== "undefined") {
            window.addEventListener("pfp_avatar_changed", loadAvatar);
            return () => window.removeEventListener("pfp_avatar_changed", loadAvatar);
        }
    }, []);

    // Fetch Herotag (username) from MultiversX Account API
    useEffect(() => {
        if (!displayAddress) {
            return;
        }

        queueMicrotask(() => {
            setIsFetchingAccount(true);
        });

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
            .catch(() => {
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
    const honoraryNames: string[] = [];
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

    // Holding Streak & Diamond Hands calculations
    const holdingDaysList = Object.values(holdingTimes).map((h) => h.daysHeld);
    const maxDaysHeld = holdingDaysList.length > 0 ? Math.max(...holdingDaysList) : 0;
    const isDiamondHands = maxDaysHeld >= 365;
    const diamondHandsBonusTickets = maxDaysHeld >= 14 ? 1 : 0;

    const isOG = heldSeasons.size > 0;
    const isCollector = hasCollectibles;
    const isWhale = nfts.length > 10;
    const isSerialCollector = [1, 2, 3, 4, 5].every((s) => heldSeasons.has(s));
    const isHonorary = hasHonorary;
    const isPerfectHolder = isOG && isCollector && isWhale && isSerialCollector && isDiamondHands;

    const unlockedCount = [isOG, isCollector, isWhale, isSerialCollector, isHonorary, isDiamondHands, isPerfectHolder].filter(Boolean).length;
    const progressPercent = (unlockedCount / 7) * 100;

    // Calculate Giveaway Odds (Total OG Base Pool = 75)
    const TOTAL_OG_TICKETS = 75;
    const totalUserTickets = ogTickets + diamondHandsBonusTickets;
    const winningOdds = totalUserTickets > 0 ? ((totalUserTickets / TOTAL_OG_TICKETS) * 100).toFixed(2) : "0.00";

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

    const scrollCarousel = (direction: "left" | "right", targetRef?: React.RefObject<HTMLDivElement | null>) => {
        const ref = targetRef || carouselRef;
        if (ref.current) {
            const scrollAmount = direction === "left" ? -340 : 340;
            ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
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

            {/* Dedicated Profile Navigation Tabs */}
            <div style={{
                display: 'flex',
                gap: '12px',
                margin: '24px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '14px',
                flexWrap: 'wrap'
            }}>
                <button
                    onClick={() => setActiveTab('holder')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '14px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: activeTab === 'holder' ? '2px solid #ec4899' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: activeTab === 'holder' ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(0,0,0,0.6))' : 'rgba(0, 0, 0, 0.4)',
                        color: activeTab === 'holder' ? '#f472b6' : '#a1a1aa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: activeTab === 'holder' ? '0 4px 20px rgba(236, 72, 153, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>👤</span> Holder Overview
                </button>

                <button
                    onClick={() => setActiveTab('hood_tycoon')}
                    style={{
                        padding: '12px 24px',
                        borderRadius: '14px',
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        border: activeTab === 'hood_tycoon' ? '2px solid #facc15' : '1px solid rgba(255, 255, 255, 0.12)',
                        background: activeTab === 'hood_tycoon' ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(0,0,0,0.6))' : 'rgba(0, 0, 0, 0.4)',
                        color: activeTab === 'hood_tycoon' ? '#facc15' : '#a1a1aa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: activeTab === 'hood_tycoon' ? '0 4px 20px rgba(250, 204, 21, 0.25)' : 'none',
                        transition: 'all 0.2s ease'
                    }}
                >
                    <span>🎲</span> HOOD TYCOON
                    <span style={{
                        fontSize: '0.7rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#facc15',
                        color: '#000',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        marginLeft: '4px'
                    }}>
                        {getRankInfo(hoodStats.streetCred).badge} {getRankInfo(hoodStats.streetCred).title}
                    </span>
                </button>
            </div>

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
            ) : activeTab === 'hood_tycoon' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {/* Rank Hero Banner */}
                    <div className="glass-panel" style={{
                        padding: '28px',
                        borderRadius: '20px',
                        border: '2px solid rgba(250, 204, 21, 0.4)',
                        background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #ca8a04, #eab308)',
                                border: '2px solid #fde047',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                boxShadow: '0 0 20px rgba(250, 204, 21, 0.4)'
                            }}>
                                {getRankInfo(hoodStats.streetCred).badge}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    HOOD TYCOON CAREER RANK
                                </span>
                                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: getRankInfo(hoodStats.streetCred).color, margin: '2px 0 0 0' }}>
                                    {getRankInfo(hoodStats.streetCred).title}
                                </h2>
                            </div>
                        </div>

                        <Link
                            href="/#hood-tycoon"
                            style={{
                                background: 'linear-gradient(135deg, #ca8a04, #facc15)',
                                color: '#000',
                                fontWeight: 900,
                                fontSize: '0.85rem',
                                padding: '10px 20px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 20px rgba(250, 204, 21, 0.4)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <span>🎮 Hood Tycoon</span>
                            <span style={{ fontSize: '0.65rem', background: '#000', color: '#facc15', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>COMING SOON</span>
                        </Link>
                    </div>

                    {/* 5 Stat Cards Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '16px'
                    }}>
                        {/* Stat 0: $PFKC Balance */}
                        {(() => {
                            const totalHoldingCoins = nfts.reduce((acc, nft) => {
                                const h = holdingTimes[nft.identifier];
                                const days = h ? (h.daysHeld || 0) : 0;
                                const sVal = getNFTSeasonValue(nft);
                                const isOGItem = sVal !== "collectibles" && sVal !== "";
                                const rate = isOGItem ? 2 : 1;
                                return acc + (days * rate);
                            }, 0);
                            const totalCoins = (hoodStats.coins || 150) + totalHoldingCoins;
                            return (
                                <div className="glass-panel" style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    border: '2px solid rgba(250, 204, 21, 0.6)',
                                    background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(0,0,0,0.6))',
                                    boxShadow: '0 4px 20px rgba(250, 204, 21, 0.2)'
                                }}>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        🪙 Available $PFKC
                                    </span>
                                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', marginTop: '4px', textShadow: '0 0 10px rgba(250, 204, 21, 0.5)' }}>
                                        {totalCoins} <span style={{ fontSize: '0.9rem', color: '#facc15', fontWeight: 800 }}>$PFKC</span>
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <span>💎</span> +{totalHoldingCoins} $PFKC from Holding (+2 $PFKC/Day per OG, +1 $PFKC/Day per Collectibles)
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Stat 1: Total REP */}
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(250, 204, 21, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase' }}>
                                🏆 Total REP
                            </span>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#facc15', marginTop: '6px' }}>
                                {hoodStats.streetCred} <span style={{ fontSize: '0.9rem', color: '#fde047' }}>REP</span>
                            </div>
                        </div>

                        {/* Stat 2: Win/Loss Ratio */}
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase' }}>
                                ⚔️ Record (W / L)
                            </span>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>
                                {hoodStats.wins}W - {hoodStats.losses}L
                                <span style={{ fontSize: '0.85rem', color: '#a1a1aa', marginLeft: '8px', fontWeight: 600 }}>
                                    ({hoodStats.totalGames > 0 ? Math.round((hoodStats.wins / hoodStats.totalGames) * 100) : 0}% Win Rate)
                                </span>
                            </div>
                        </div>

                        {/* Stat 3: Best Score & Streak */}
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase' }}>
                                🔥 Best Score & Streak
                            </span>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#c084fc', marginTop: '6px' }}>
                                Best: {hoodStats.bestScore} Pts
                                <span style={{ fontSize: '0.85rem', color: '#fde047', marginLeft: '10px' }}>
                                    🔥 {hoodStats.currentStreak} Streak
                                </span>
                            </div>
                        </div>

                        {/* Stat 4: Total Matches */}
                        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#a1a1aa', textTransform: 'uppercase' }}>
                                🎮 Total Matches Played
                            </span>
                            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#4ade80', marginTop: '6px' }}>
                                {hoodStats.totalGames} <span style={{ fontSize: '0.9rem', color: '#a1a1aa' }}>Matches</span>
                            </div>
                        </div>
                    </div>

                    {/* Section: Badges Carousel under Hood Tycoon Stats */}
                    {(() => {
                        const totalHoldingCoins = nfts.reduce((acc, nft) => {
                            const h = holdingTimes[nft.identifier];
                            const days = h ? (h.daysHeld || 0) : 0;
                            const sVal = getNFTSeasonValue(nft);
                            const isOGItem = sVal !== "collectibles" && sVal !== "";
                            const rate = isOGItem ? 2 : 1;
                            return acc + (days * rate);
                        }, 0);
                        const currentBalance = (hoodStats.coins || 150) + totalHoldingCoins;

                        const isFirstHustle = hoodStats.totalGames >= 1;
                        const isFirstVictory = hoodStats.wins >= 1;
                        const isHotStreak = hoodStats.bestStreak >= 3;
                        const isBribeMaster = currentBalance >= 500;
                        const isStreetCredBoss = hoodStats.streetCred >= 500;
                        const isCenturyMaster = hoodStats.bestScore >= 100;

                        const unlockedGameBadges = [
                            isFirstHustle,
                            isFirstVictory,
                            isHotStreak,
                            isBribeMaster,
                            isStreetCredBoss,
                            isCenturyMaster
                        ].filter(Boolean).length;

                        const isDonOfTheBlock = unlockedGameBadges === 6 && hoodStats.streetCred >= 1500;
                        const totalGameUnlockedCount = unlockedGameBadges + (isDonOfTheBlock ? 1 : 0);
                        const gameProgressPercent = (totalGameUnlockedCount / 7) * 100;

                        return (
                            <div className="profile-badges-section" style={{ marginTop: '8px' }}>
                                <div className="badges-section-header">
                                    <div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
                                            <span>🎲</span> Hood Tycoon Game Achievements
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                                            Unlocked {totalGameUnlockedCount} of 7 Game Badges • Scroll to view all
                                        </p>
                                    </div>

                                    {/* Carousel Controls */}
                                    <div className="carousel-nav-buttons">
                                        <button onClick={() => scrollCarousel("left", hoodCarouselRef)} className="carousel-btn" aria-label="Previous Badges">
                                            ←
                                        </button>
                                        <button onClick={() => scrollCarousel("right", hoodCarouselRef)} className="carousel-btn" aria-label="Next Badges">
                                            →
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="badge-progress-card" style={{ marginBottom: '1.25rem' }}>
                                    <div className="badge-progress-header">
                                        <span className="badge-progress-title">Game Career Progress</span>
                                        <span className="badge-progress-stats">{totalGameUnlockedCount} / 7 Unlocked ({gameProgressPercent.toFixed(0)}%)</span>
                                    </div>
                                    <div className="badge-progress-bar-bg">
                                        <div 
                                            className="badge-progress-bar-fill" 
                                            style={{ width: `${gameProgressPercent}%`, background: 'linear-gradient(90deg, #ca8a04, #facc15)' }}
                                        />
                                    </div>
                                </div>

                                {/* Badges Carousel Track */}
                                <div className="badges-carousel-container" ref={hoodCarouselRef}>
                                    <div className="badges-carousel-track">
                                        {/* 1. First Hustle */}
                                        <div className={`badge-detail-card carousel-badge-card ${isFirstHustle ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                🧢
                                                {!isFirstHustle && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">First Hustle</h3>
                                            <p className="badge-detail-card-desc">
                                                Stepped onto the block and played your first match in Hood Tycoon.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Play ≥ 1 match
                                                <div style={{ marginTop: '6px', color: isFirstHustle ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isFirstHustle ? `✅ Played ${hoodStats.totalGames} match(es)` : "❌ No matches played yet"}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isFirstHustle ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 2. Block Victory */}
                                        <div className={`badge-detail-card carousel-badge-card ${isFirstVictory ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                🏆
                                                {!isFirstVictory && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Block Victory</h3>
                                            <p className="badge-detail-card-desc">
                                                Outsmarted the rival Bot and conquered your first Hood Tycoon victory.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Win ≥ 1 match
                                                <div style={{ marginTop: '6px', color: isFirstVictory ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isFirstVictory ? `✅ Wins: ${hoodStats.wins}` : "❌ Win 1 match"}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isFirstVictory ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 3. Hot Streak */}
                                        <div className={`badge-detail-card carousel-badge-card ${isHotStreak ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                🔥
                                                {!isHotStreak && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Hot Streak</h3>
                                            <p className="badge-detail-card-desc">
                                                Dominating the streets! Achieved a winning streak of 3 consecutive matches.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Streak ≥ 3 wins
                                                <div style={{ marginTop: '6px', color: isHotStreak ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isHotStreak ? `✅ Best streak: 🔥 ${hoodStats.bestStreak}` : `❌ Best streak: ${hoodStats.bestStreak} / 3`}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isHotStreak ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 4. Bribe Master */}
                                        <div className={`badge-detail-card carousel-badge-card ${isBribeMaster ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                🪙
                                                {!isBribeMaster && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Bribe Master</h3>
                                            <p className="badge-detail-card-desc">
                                                High roller status! Accumulated a balance of 500 or more Hood Coins.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Balance ≥ 500 Coins
                                                <div style={{ marginTop: '6px', color: isBribeMaster ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isBribeMaster ? `✅ Balance: ${currentBalance} Coins` : `❌ Current: ${currentBalance} / 500 Coins`}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isBribeMaster ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 5. Street Cred Boss */}
                                        <div className={`badge-detail-card carousel-badge-card ${isStreetCredBoss ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                💼
                                                {!isStreetCredBoss && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Street Cred Boss</h3>
                                            <p className="badge-detail-card-desc">
                                                Respected in all 4 districts! Earned 500 or more Total Street Cred points.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Street Cred ≥ 500 Pts
                                                <div style={{ marginTop: '6px', color: isStreetCredBoss ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isStreetCredBoss ? `✅ Total Cred: ${hoodStats.streetCred} Pts` : `❌ Progress: ${hoodStats.streetCred} / 500 Pts`}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isStreetCredBoss ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 6. Century Master */}
                                        <div className={`badge-detail-card carousel-badge-card ${isCenturyMaster ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                ⚡
                                                {!isCenturyMaster && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Century Master</h3>
                                            <p className="badge-detail-card-desc">
                                                Flawless victory! Scored 100 or more street points in a single match.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Match score ≥ 100 Pts
                                                <div style={{ marginTop: '6px', color: isCenturyMaster ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isCenturyMaster ? `✅ Best match score: ${hoodStats.bestScore} Pts` : `❌ Best score: ${hoodStats.bestScore} / 100 Pts`}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isCenturyMaster ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>

                                        {/* 7. Don of the Block */}
                                        <div className={`badge-detail-card carousel-badge-card ${isDonOfTheBlock ? 'unlocked' : 'locked'}`}>
                                            <div className="badge-detail-card-icon">
                                                👑
                                                {!isDonOfTheBlock && <div className="badge-detail-card-lock">🔒</div>}
                                            </div>
                                            <h3 className="badge-detail-card-title">Don of the Block</h3>
                                            <p className="badge-detail-card-desc">
                                                The undisputed master of Hood Politics. Unlocked all 6 game achievements and reached 1500+ Cred.
                                            </p>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                                <strong>Requirement:</strong> Unlock 6 game badges + 1500 Cred
                                                <div style={{ marginTop: '6px', color: isDonOfTheBlock ? '#10b981' : 'var(--text-secondary)' }}>
                                                    {isDonOfTheBlock ? "✅ You are the Don of Hood Tycoon!" : `❌ Progress: ${unlockedGameBadges} / 6 badges unlocked`}
                                                </div>
                                            </div>
                                            <span className="badge-detail-card-status-badge">
                                                {isDonOfTheBlock ? "Unlocked" : "Locked"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Recent Match History */}
                    <div className="glass-panel" style={{ padding: '24px', borderRadius: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fff', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>📜</span> Recent Match History
                        </h3>

                        {hoodStats.history.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                No matches played yet. Click <strong>Play Hood Tycoon Now</strong> to launch your first battle!
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {hoodStats.history.map((m, idx) => (
                                    <div
                                        key={m.id || idx}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            background: 'rgba(0, 0, 0, 0.5)',
                                            border: `1px solid ${m.result === 'win' ? 'rgba(16, 185, 129, 0.4)' : m.result === 'loss' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{
                                                fontSize: '0.75rem',
                                                fontWeight: 900,
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                textTransform: 'uppercase',
                                                background: m.result === 'win' ? 'rgba(16, 185, 129, 0.2)' : m.result === 'loss' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                                color: m.result === 'win' ? '#10b981' : m.result === 'loss' ? '#f43f5e' : '#fff'
                                            }}>
                                                {m.result}
                                            </span>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>
                                                You ({m.playerScore}) - Bot ({m.botScore})
                                            </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#a1a1aa' }}>
                                            <span style={{ color: '#facc15', fontWeight: 800 }}>+{m.streetCredEarned} REP</span>
                                            <span>{m.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="profile-main-layout">
                    {/* Top 2-Column Grid: Welcome Panel + Vault Box */}
                    <div className="profile-top-grid">
                        {/* Left Column: Welcome Greeting */}
                        <div className="profile-welcome-panel glass-panel">
                            <div className="profile-avatar-badge" style={{ overflow: 'hidden', padding: 0, border: '3px solid rgba(236, 72, 153, 0.6)' }}>
                                {userAvatar?.imageUrl ? (
                                    <img 
                                        src={userAvatar.imageUrl} 
                                        alt={userAvatar.character || "Profile Avatar"} 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : nfts.length > 0 && (nfts[0].media?.[0]?.thumbnailUrl || nfts[0].url) ? (
                                    <img 
                                        src={nfts[0].media?.[0]?.thumbnailUrl || nfts[0].url} 
                                        alt="Profile Avatar" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    "⚡"
                                )}
                            </div>
                            <div className="profile-welcome-info">
                                <span className="profile-welcome-subtitle">Welcome Back</span>
                                <h2 className="profile-welcome-title">
                                    {welcomeName}
                                </h2>
                                {userAvatar?.character && (
                                    <div style={{ fontSize: '0.82rem', color: '#ec4899', fontWeight: 700, margin: '2px 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ opacity: 0.8 }}>🎭 Avatar PFP:</span>
                                        <span style={{ color: 'var(--text-primary)', background: 'rgba(236, 72, 153, 0.15)', padding: '2px 8px', borderRadius: '6px', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
                                            {userAvatar.character}
                                        </span>
                                    </div>
                                )}
                                <div className="profile-welcome-tags" style={{ marginTop: '4px' }}>
                                    <span className="profile-tag purple">
                                        🖼️ {nfts.length} NFTs Held
                                    </span>
                                    <span className="profile-tag pink">
                                        🎟️ {ogTickets} OG Raffle Tickets
                                    </span>
                                    <span className="profile-tag green">
                                        🏅 {unlockedCount}/6 Badges
                                    </span>
                                    {maxDaysHeld > 0 && (
                                        <span className="profile-tag cyan" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                            💎 {maxDaysHeld}d Holding Streak
                                        </span>
                                    )}
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
                                <div className="stat-box-label">Your OG Tickets</div>
                                <div className="stat-box-value pink">{ogTickets}</div>
                                <div className="stat-box-sub">Base tickets (1 per OG NFT)</div>
                            </div>
                            <div className="giveaway-stat-box">
                                <div className="stat-box-label">Holding Bonus</div>
                                <div className="stat-box-value" style={{ color: '#38bdf8' }}>+{diamondHandsBonusTickets}</div>
                                <div className="stat-box-sub">{maxDaysHeld >= 14 ? `Loyalty bonus (${maxDaysHeld}d streak)` : 'Hold 14+ days for bonus ticket'}</div>
                            </div>
                            <div className="giveaway-stat-box">
                                <div className="stat-box-label">Total Pool</div>
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
                            {totalUserTickets > 0 ? (
                                <span style={{ color: '#10b981', fontWeight: 600 }}>
                                    ✅ You have {totalUserTickets} total raffle tickets ({ogTickets} base + {diamondHandsBonusTickets} holding loyalty bonus) for the next draw!
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
                                    Unlocked {unlockedCount} of 7 badges
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
                                <span className="badge-progress-stats">{unlockedCount} / 7 Unlocked ({progressPercent.toFixed(0)}%)</span>
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

                                {/* 6. Diamond Hands */}
                                <div className={`badge-detail-card carousel-badge-card ${isDiamondHands ? 'unlocked' : 'locked'}`}>
                                    <div className="badge-detail-card-icon">
                                        💎
                                        {!isDiamondHands && <div className="badge-detail-card-lock">🔒</div>}
                                    </div>
                                    <h3 className="badge-detail-card-title">Diamond Hands</h3>
                                    <p className="badge-detail-card-desc">
                                        Awarded to legendary collectors who have held an NFT in their wallet for at least 365 days.
                                    </p>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'left', width: '100%' }}>
                                        <strong>Requirement:</strong> Hold ≥ 1 NFT for 365+ days
                                        <div style={{ marginTop: '6px', color: isDiamondHands ? '#10b981' : 'var(--text-secondary)' }}>
                                            {isDiamondHands 
                                                ? `✅ Diamond Hands achieved: ${maxDaysHeld} days held!` 
                                                : `❌ Current longest hold: ${maxDaysHeld} / 365 days`
                                            }
                                        </div>
                                    </div>
                                    <span className="badge-detail-card-status-badge">
                                        {isDiamondHands ? "Unlocked" : "Locked"}
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
