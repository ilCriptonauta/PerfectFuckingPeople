"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/out/react/account/useGetAccountInfo";

const COLLECTION_ID = "PFP-717e46";
const ADMIN_ADDRESS = "erd1vhkwevjs3v0564x7j4j7z2jl4n9zhpfvys9ddvn5m6j40fqn4fssxl65u8";

interface NFTItem {
  identifier: string;
  name: string;
  url: string;
  media?: Array<{
    thumbnailUrl: string;
  }>;
  metadata?: {
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  timestamp?: number;
  holdingDays?: number;
}

interface Holder {
  address: string;
  balance: number;
  username: string;
}

export default function LeaderboardPage() {
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address: userAddress } = useGetAccountInfo();
  
  const simulateAddress = searchParams.get("simulate");
  const isSimulating = !!simulateAddress;
  const currentAddress = simulateAddress || userAddress;
  
  const isAdmin = currentAddress?.toLowerCase() === ADMIN_ADDRESS.toLowerCase();

  const [mounted, setMounted] = useState(false);
  const [holders, setHolders] = useState<Holder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [expandedAddress, setExpandedAddress] = useState<string | null>(null);

  // Lazy loading details for holders
  const [nftDetails, setNftDetails] = useState<Record<string, NFTItem[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>({});
  const [detailsErrors, setDetailsErrors] = useState<Record<string, string>>({});

  // Admin actions states
  const [adminStep, setAdminStep] = useState<number>(0);
  const [isFetchingAllDetails, setIsFetchingAllDetails] = useState<boolean>(false);

  // Giveaway states
  const [isGiveawayOpen, setIsGiveawayOpen] = useState<boolean>(false);
  const [giveawayWinner, setGiveawayWinner] = useState<Holder | null>(null);
  const [winnerStats, setWinnerStats] = useState<{ tickets: number; totalTickets: number; odds: string } | null>(null);
  const [isWinnerAddressCopied, setIsWinnerAddressCopied] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawingDisplay, setDrawingDisplay] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoggedIn && !isSimulating) {
      router.push("/");
    }
  }, [isLoggedIn, router, mounted, isSimulating]);

  useEffect(() => {
    if (!mounted || (!isLoggedIn && !isSimulating)) return;

    const fetchLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch the list of accounts holding collection NFTs
        const res = await fetch(`https://api.multiversx.com/collections/${COLLECTION_ID}/accounts?size=100`);
        if (!res.ok) {
          throw new Error("Failed to fetch collection accounts");
        }
        const data = await res.json();
        
        // 2. Aggregate balances and filter out contract addresses
        const counts: Record<string, number> = {};
        data.forEach((item: any) => {
          if (item.address) {
            if (!item.address.startsWith("erd1qqqqqqqqqqqqqpgq")) {
              counts[item.address] = (counts[item.address] || 0) + 1;
            }
          }
        });

        const sortedHolders: Holder[] = Object.entries(counts).map(([address, balance]) => ({
          address,
          balance,
          username: ""
        })).sort((a, b) => b.balance - a.balance);

        // 3. Fetch herotags for all addresses in a single request
        const addressesToFetch = sortedHolders.map(h => h.address).join(",");
        if (addressesToFetch) {
          const accsRes = await fetch(`https://api.multiversx.com/accounts?addresses=${addressesToFetch}`);
          if (accsRes.ok) {
            const accountsInfo = await accsRes.json();
            const usernameMap: Record<string, string> = {};
            accountsInfo.forEach((acc: any) => {
              if (acc.username) {
                usernameMap[acc.address] = acc.username;
              }
            });
            
            sortedHolders.forEach(h => {
              if (usernameMap[h.address]) {
                h.username = usernameMap[h.address];
              }
            });
          }
        }

        setHolders(sortedHolders);
      } catch (err: any) {
        console.error("Error building leaderboard:", err);
        setError(err.message || "Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [mounted, isLoggedIn, isSimulating]);

  if (!mounted || (!isLoggedIn && !isSimulating)) {
    return null;
  }

  const handleCopy = (address: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getShortAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const toggleExpand = async (address: string) => {
    if (!isAdmin) return;
    
    if (expandedAddress === address) {
      setExpandedAddress(null);
      return;
    }
    
    setExpandedAddress(address);
    
    if (nftDetails[address] || loadingDetails[address]) {
      return;
    }
    
    // Fetch user details dynamically
    setLoadingDetails(prev => ({ ...prev, [address]: true }));
    setDetailsErrors(prev => ({ ...prev, [address]: "" }));
    
    try {
      const res = await fetch(`https://api.multiversx.com/accounts/${address}/nfts?collections=${COLLECTION_ID}&size=100`);
      if (!res.ok) {
        throw new Error("Failed to fetch user NFT details");
      }
      const rawNfts = await res.json();
      const now = Math.floor(Date.now() / 1000);

      const userNfts = await Promise.all(
        (rawNfts || []).map(async (nft: any) => {
          let holdingTimestamp: number | null = null;
          try {
            const txRes = await fetch(`https://api.multiversx.com/nfts/${nft.identifier}/transactions?status=success&size=5`);
            if (txRes.ok) {
              const txs = await txRes.json();
              if (Array.isArray(txs) && txs.length > 0) {
                const lastRx = txs.find((t: any) => t.receiver === address || t.action?.arguments?.receiver === address);
                if (lastRx && lastRx.timestamp) {
                  holdingTimestamp = lastRx.timestamp;
                } else if (txs[0] && txs[0].timestamp) {
                  holdingTimestamp = txs[0].timestamp;
                }
              }
            }
          } catch (e) {}

          if (!holdingTimestamp && nft.timestamp) {
            holdingTimestamp = nft.timestamp;
          }

          const finalTs = holdingTimestamp || now;
          const daysHeld = Math.max(1, Math.floor((now - finalTs) / 86400));
          return {
            ...nft,
            timestamp: finalTs,
            holdingDays: daysHeld
          };
        })
      );

      setNftDetails(prev => ({ ...prev, [address]: userNfts || [] }));
    } catch (err: any) {
      console.error(`Error fetching details for ${address}:`, err);
      setDetailsErrors(prev => ({ ...prev, [address]: err.message || "Failed to load details" }));
    } finally {
      setLoadingDetails(prev => ({ ...prev, [address]: false }));
    }
  };

  const getNFTSeasonCategory = (nft: NFTItem): { label: string; class: string } => {
    const seasonAttr = nft.metadata?.attributes?.find(
      (a) => a.trait_type?.toLowerCase() === "season"
    );
    if (!seasonAttr) return { label: "Collectible", class: "collectible" };
    const valStr = String(seasonAttr.value).trim();
    const num = parseInt(valStr, 10);
    if (!isNaN(num)) {
      if (num >= 1 && num <= 5) {
        return { label: `Season ${num}`, class: `s${num}` };
      }
    }
    return { label: "Collectible", class: "collectible" };
  };

  const checkIsOG = (address: string): boolean => {
    const userNfts = nftDetails[address] || [];
    return userNfts.some((nft) => {
      const cat = getNFTSeasonCategory(nft);
      return cat.label.startsWith("Season");
    });
  };

  const handleExportJSON = () => {
    const ogHoldersData = holders
      .filter((h) => checkIsOG(h.address))
      .map((h) => {
        const userNfts = nftDetails[h.address] || [];
        const seasons: Record<string, number> = {};
        userNfts.forEach((nft) => {
          const cat = getNFTSeasonCategory(nft);
          seasons[cat.label] = (seasons[cat.label] || 0) + 1;
        });

        return {
          address: h.address,
          herotag: h.username || "",
          balance: h.balance,
          seasons,
          nfts: userNfts.map((nft) => {
            const cat = getNFTSeasonCategory(nft);
            const mission = nft.metadata?.attributes?.find(
              (a) => a.trait_type?.toLowerCase() === "mission"
            )?.value || "N/A";

            return {
              identifier: nft.identifier,
              name: nft.name,
              season: cat.label,
              mission,
              holdingDays: nft.holdingDays || 1
            };
          })
        };
      });

    const blob = new Blob([JSON.stringify(ogHoldersData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = url;
    downloadAnchor.download = `og_holders_${COLLECTION_ID}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
  };

  const ensureAllDetailsLoaded = async (currentHoldersList: Holder[]) => {
    setIsFetchingAllDetails(true);
    try {
      // Fetch all NFTs with owners (paging by 100 to avoid MultiversX API size limits)
      let allNftsWithOwner: any[] = [];
      let from = 0;
      const pageSize = 100;
      let hasMore = true;

      while (hasMore) {
        const res = await fetch(
          `https://api.multiversx.com/nfts?collection=${COLLECTION_ID}&from=${from}&size=${pageSize}&withOwner=true`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch collection NFTs with owners");
        }
        const data = await res.json();
        allNftsWithOwner = [...allNftsWithOwner, ...data];
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      }

      const now = Math.floor(Date.now() / 1000);
      // Group NFTs by owner
      const grouped: Record<string, NFTItem[]> = {};
      allNftsWithOwner.forEach((nft: any) => {
        const ownerAddr = nft.owner;
        if (ownerAddr) {
          if (!grouped[ownerAddr]) {
            grouped[ownerAddr] = [];
          }
          const ts = nft.timestamp || now;
          const daysHeld = Math.max(1, Math.floor((now - ts) / 86400));
          grouped[ownerAddr].push({
            identifier: nft.identifier,
            name: nft.name,
            url: nft.url,
            media: nft.media,
            metadata: nft.metadata,
            timestamp: ts,
            holdingDays: daysHeld
          });
        }
      });

      // Update nftDetails state with the grouped data
      const newNftDetails = { ...nftDetails };
      currentHoldersList.forEach(holder => {
        newNftDetails[holder.address] = grouped[holder.address] || [];
      });

      setNftDetails(newNftDetails);
      return newNftDetails;
    } catch (err: any) {
      console.error("Error pre-fetching OG data in bulk:", err);
      return nftDetails;
    } finally {
      setIsFetchingAllDetails(false);
    }
  };

  const handleAdminAction = async () => {
    if (adminStep === 0) {
      await ensureAllDetailsLoaded(holders);
      setAdminStep(1);
    } else if (adminStep === 1) {
      handleExportJSON();
      setAdminStep(2);
    } else if (adminStep === 2) {
      setAdminStep(0);
    }
  };

  const startGiveaway = async () => {
    setIsGiveawayOpen(true);
    setGiveawayWinner(null);
    setWinnerStats(null);
    setIsDrawing(true);
    setDrawingDisplay("Initializing Raffle Pool...");
    setIsWinnerAddressCopied(false);

    // Ensure details are loaded to identify who qualifies as OG and calculate tickets
    let activeDetails = nftDetails;
    const missingAny = holders.some(h => !nftDetails[h.address]);
    if (missingAny) {
      activeDetails = await ensureAllDetailsLoaded(holders);
    }

    const getOGCount = (addr: string, details: Record<string, NFTItem[]>) => {
      const userNfts = details[addr] || [];
      return userNfts.filter((nft) => {
        const cat = getNFTSeasonCategory(nft);
        return cat.label.startsWith("Season");
      }).length;
    };

    const ogHolders = holders.filter(h => 
      h.address !== "erd1vhkwevjs3v0564x7j4j7z2jl4n9zhpfvys9ddvn5m6j40fqn4fssxl65u8" &&
      getOGCount(h.address, activeDetails) > 0
    );

    if (ogHolders.length === 0) {
      setDrawingDisplay("No OG Holders found!");
      setIsDrawing(false);
      return;
    }

    // Build weighted raffle ticket pool: 1 ticket per OG NFT owned
    const rafflePool: { holder: Holder; tickets: number }[] = [];
    ogHolders.forEach(h => {
      const tickets = getOGCount(h.address, activeDetails);
      for (let i = 0; i < tickets; i++) {
        rafflePool.push({ holder: h, tickets });
      }
    });

    runDrawAnimation(rafflePool);
  };

  const runDrawAnimation = (rafflePool: { holder: Holder; tickets: number }[]) => {
    setIsDrawing(true);
    setGiveawayWinner(null);
    setWinnerStats(null);

    let speed = 50;
    let iterations = 0;
    const maxIterations = 35;
    const totalTickets = rafflePool.length;

    const cycle = () => {
      const randomEntry = rafflePool[Math.floor(Math.random() * rafflePool.length)];
      const displayText = randomEntry.holder.username || getShortAddress(randomEntry.holder.address);
      setDrawingDisplay(displayText);
      
      iterations++;
      
      if (iterations < maxIterations) {
        speed += iterations * 2.5;
        setTimeout(cycle, speed);
      } else {
        const winnerEntry = rafflePool[Math.floor(Math.random() * rafflePool.length)];
        const winner = winnerEntry.holder;
        const odds = ((winnerEntry.tickets / totalTickets) * 100).toFixed(2);
        
        setGiveawayWinner(winner);
        setWinnerStats({
          tickets: winnerEntry.tickets,
          totalTickets,
          odds
        });
        setDrawingDisplay(winner.username || getShortAddress(winner.address));
        setIsDrawing(false);
      }
    };

    setTimeout(cycle, speed);
  };

  const handleCopyWinnerAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setIsWinnerAddressCopied(true);
    setTimeout(() => setIsWinnerAddressCopied(false), 2000);
  };

  const displayedHolders = (adminStep === 1 || adminStep === 2)
    ? holders.filter((h) => checkIsOG(h.address))
    : holders;

  const backUrl = isSimulating ? `/gallery?simulate=${simulateAddress}` : "/gallery";

  return (
    <div className="leaderboard-container">
      <Link href={backUrl} className="back-link">
        ← Back to Gallery
      </Link>

      <header className="leaderboard-header">
        <h1>
          <span className="text-gradient">Holders</span> Leaderboard
        </h1>
        <p>Top collectors of the Perfect Fucking People ({COLLECTION_ID}) collection</p>
        {isAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div className="admin-badge">
              ⚡ Admin View Enabled
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={handleAdminAction}
                className={`btn-admin-action ${adminStep === 1 ? 'step-1' : adminStep === 2 ? 'step-2' : ''}`}
                disabled={isFetchingAllDetails}
                style={{ marginTop: 0 }}
              >
                {isFetchingAllDetails ? (
                  <>
                    <span className="loading-spinner-small" style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderTopColor: '#fff',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }} /> Loading OG Status...
                  </>
                ) : adminStep === 0 ? (
                  <>⚡ Filter OG Holders</>
                ) : adminStep === 1 ? (
                  <>📥 Export OG List (.json)</>
                ) : (
                  <>🔄 Reset View</>
                )}
              </button>
              
              <button 
                onClick={startGiveaway}
                className="btn-admin-giveaway"
                disabled={isFetchingAllDetails}
              >
                🎁 OG Giveaway
              </button>
            </div>
          </div>
        )}
      </header>

      {isLoading ? (
        <div className="leaderboard-table-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div className="loading-spinner" style={{
            margin: '0 auto 1.5rem',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '3px solid rgba(236, 72, 153, 0.1)',
            borderTopColor: 'var(--accent-secondary)',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Loading holders data...</p>
        </div>
      ) : error ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: '#ff4d4d' }}>
          <p>Error loading leaderboard: {error}</p>
        </div>
      ) : (
        <div className="leaderboard-table-card">
          <div className="leaderboard-table-responsive">
            <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Rank</th>
                <th style={{ width: '50%' }}>Holder</th>
                <th style={{ width: '20%' }}>NFTs Owned</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedHolders.map((holder) => {
                const rank = holders.findIndex(h => h.address === holder.address) + 1;
                const isMe = holder.address.toLowerCase() === currentAddress?.toLowerCase();
                const isExpanded = expandedAddress === holder.address;
                
                // Get NFT details if loaded
                const userNfts = nftDetails[holder.address] || [];
                const isDetailLoading = loadingDetails[holder.address];
                const detailError = detailsErrors[holder.address];
                
                // Calculate season breakdown and OG status if details loaded
                const seasons: Record<string, number> = {};
                let isOG = false;
                
                if (userNfts.length > 0) {
                  userNfts.forEach((nft) => {
                    const cat = getNFTSeasonCategory(nft);
                    seasons[cat.label] = (seasons[cat.label] || 0) + 1;
                    if (cat.label.startsWith("Season")) {
                      isOG = true;
                    }
                  });
                }

                return (
                  <React.Fragment key={holder.address}>
                    <tr 
                      className={`leaderboard-row ${isAdmin ? 'clickable' : ''}`}
                      onClick={() => toggleExpand(holder.address)}
                    >
                      <td>
                        <div className="rank-cell">
                          {rank === 1 ? (
                            <div className="rank-badge rank-1" title="Top Holder">👑</div>
                          ) : rank === 2 ? (
                            <div className="rank-badge rank-2">🥈</div>
                          ) : rank === 3 ? (
                            <div className="rank-badge rank-3">🥉</div>
                          ) : (
                            <div className="rank-badge rank-other">{rank}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="identity-cell">
                          <div className="herotag-name">
                            {holder.username ? (
                              <span>{holder.username}</span>
                            ) : (
                              <span>{getShortAddress(holder.address)}</span>
                            )}
                            {isMe && <span className="owner-badge">You</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="balance-cell">
                          {holder.balance} <span>NFTs</span>
                        </div>
                      </td>
                      <td>
                        <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                          <button 
                            onClick={(e) => handleCopy(holder.address, e)} 
                            className="btn-action"
                            title="Copy Address"
                          >
                            {copiedAddress === holder.address ? "Copied!" : "Copy"}
                          </button>
                          <Link 
                            href={`/gallery?simulate=${holder.address}`} 
                            className="btn-action btn-action-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Inspect
                          </Link>
                          <a 
                            href={`https://explorer.multiversx.com/accounts/${holder.address}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn-action"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Explorer
                          </a>
                        </div>
                      </td>
                    </tr>

                    {/* Admin Expanded Details Panel */}
                    {isAdmin && isExpanded && (
                      <tr className="expanded-detail-row">
                        <td colSpan={4}>
                          <div className="expanded-detail-container">
                            <div className="detail-header">
                              <div className="detail-title">
                                Wallet Details: {holder.username || getShortAddress(holder.address)}
                              </div>
                              
                              {!isDetailLoading && !detailError && userNfts.length > 0 && (
                                <div className={`og-eligibility-badge ${isOG ? 'qualified' : 'not-qualified'}`}>
                                  {isOG ? '★ OG Qualified' : 'Not OG Qualified'}
                                </div>
                              )}
                            </div>

                            {isDetailLoading ? (
                              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <div className="loading-spinner" style={{
                                  margin: '0 auto 1rem',
                                  width: '30px',
                                  height: '30px',
                                  borderRadius: '50%',
                                  border: '2px solid rgba(236, 72, 153, 0.1)',
                                  borderTopColor: 'var(--accent-secondary)',
                                  animation: 'spin 1s linear infinite'
                                }}></div>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading NFTs details...</p>
                              </div>
                            ) : detailError ? (
                              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#ff4d4d', fontSize: '0.85rem' }}>
                                Error: {detailError}
                              </div>
                            ) : (
                              <>
                                {/* Season Breakdown */}
                                <div className="season-breakdown-container">
                                  {Object.entries(seasons).map(([seasonLabel, count]) => (
                                    <div 
                                      key={seasonLabel} 
                                      className={`season-pill ${seasonLabel.startsWith('Season') ? 'highlight' : ''}`}
                                    >
                                      {seasonLabel}: <strong>{count}</strong> {count === 1 ? 'NFT' : 'NFTs'}
                                    </div>
                                  ))}
                                  {(() => {
                                    const holdingDaysList = userNfts.map(n => n.holdingDays || 0).filter(d => d > 0);
                                    const maxDays = holdingDaysList.length > 0 ? Math.max(...holdingDaysList) : 0;
                                    return maxDays > 0 ? (
                                      <div 
                                        className="season-pill"
                                        style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                                      >
                                        💎 Max Hold: <strong>{maxDays}d</strong>
                                      </div>
                                    ) : null;
                                  })()}
                                  {Object.keys(seasons).length === 0 && (
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                      No season attributes found for this holder's NFTs.
                                    </div>
                                  )}
                                </div>

                                {/* NFT Gallery Grid */}
                                <div className="admin-nft-grid">
                                  {userNfts.map((nft) => {
                                    const thumbUrl = nft.media?.[0]?.thumbnailUrl || nft.url;
                                    const cat = getNFTSeasonCategory(nft);

                                    return (
                                      <div key={nft.identifier} className="admin-nft-card">
                                        <div className="admin-nft-thumb">
                                          {thumbUrl ? (
                                            <img src={thumbUrl} alt={nft.name} loading="lazy" />
                                          ) : (
                                            <div style={{
                                              width: '100%',
                                              height: '100%',
                                              background: 'rgba(255,255,255,0.05)',
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              fontSize: '10px',
                                              color: 'var(--text-secondary)'
                                            }}>
                                              No Img
                                            </div>
                                          )}
                                        </div>
                                        <div className="admin-nft-name" title={nft.name}>
                                          {nft.name || nft.identifier}
                                        </div>
                                        <div className={`admin-nft-season-tag ${cat.class}`}>
                                          {cat.label}
                                        </div>
                                        {nft.holdingDays !== undefined && (
                                          <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 700, marginTop: '4px' }}>
                                            🗓️ {nft.holdingDays}d hold
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {displayedHolders.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                    {adminStep === 1 || adminStep === 2 ? "No OG holders found." : "No holders found for this collection."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {isGiveawayOpen && createPortal(
        <div className="giveaway-overlay" onClick={() => !isDrawing && setIsGiveawayOpen(false)}>
          <div className="giveaway-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="giveaway-title">🎉 OG Monthly Giveaway 🎉</h2>
            <div className="giveaway-subtitle">Weighted raffle draw among Season 1-5 holders (+1 Ticket per OG NFT)</div>

            <div className={`giveaway-drum-container ${isDrawing ? 'drawing' : ''}`}>
              <div className={`giveaway-drum-text ${giveawayWinner ? 'winner' : ''}`}>
                {drawingDisplay}
              </div>
            </div>

            {giveawayWinner && winnerStats && (
              <div className="giveaway-winner-detail">
                <div className="winner-congrats">✨ Lucky Winner Selected ✨</div>
                <div className="winner-tag">
                  {giveawayWinner.username || "Anonymous PFP Collector"}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 'bold',
                  margin: '8px 0',
                  padding: '6px 14px',
                  background: 'rgba(236, 72, 153, 0.12)',
                  borderRadius: '10px',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  display: 'inline-block'
                }}>
                  🎟️ OG NFTs Owned: {winnerStats.tickets} ({winnerStats.odds}% Winning Odds)
                </div>
                <div className="winner-address-box">
                  {giveawayWinner.address}
                </div>
                <button 
                  onClick={() => handleCopyWinnerAddress(giveawayWinner.address)}
                  className="btn-winner-copy"
                >
                  {isWinnerAddressCopied ? "Copied Winner Address!" : "Copy Address"}
                </button>
              </div>
            )}

            <div className="giveaway-actions">
              <button 
                onClick={startGiveaway} 
                disabled={isDrawing} 
                className="btn-modal-reroll"
              >
                {isDrawing ? "Drawing..." : giveawayWinner ? "🔄 Draw Again" : "Start Draw"}
              </button>
              <button 
                onClick={() => setIsGiveawayOpen(false)} 
                disabled={isDrawing} 
                className="btn-modal-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
