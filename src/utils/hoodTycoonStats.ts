'use client';

export interface MatchHistoryItem {
  id: string;
  result: 'win' | 'loss' | 'draw';
  playerScore: number;
  botScore: number;
  streetCredEarned: number;
  date: string;
}

export interface HoodTycoonCareerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  streetCred: number;
  coins: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
  history: MatchHistoryItem[];
}

const DEFAULT_STATS: HoodTycoonCareerStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  streetCred: 0,
  coins: 150, // Starting welcome coins bonus
  bestScore: 0,
  currentStreak: 0,
  bestStreak: 0,
  history: []
};

export function getRankInfo(streetCred: number): {
  title: string;
  badge: string;
  color: string;
  nextRankThreshold: number;
} {
  if (streetCred >= 3000) {
    return { title: 'The Don of Hood Tycoon', badge: '👑', color: '#facc15', nextRankThreshold: 3000 };
  } else if (streetCred >= 1500) {
    return { title: 'Block Boss', badge: '👔', color: '#a855f7', nextRankThreshold: 3000 };
  } else if (streetCred >= 500) {
    return { title: 'Hood Lieutenant', badge: '💼', color: '#38bdf8', nextRankThreshold: 1500 };
  } else {
    return { title: 'Street Hustler', badge: '🧢', color: '#4ade80', nextRankThreshold: 500 };
  }
}

export function getHoodTycoonStats(address?: string | null): HoodTycoonCareerStats {
  if (!address || typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const key = `pfp_hood_tycoon_stats_${address.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure coins has a default value if upgrading from old schema
      if (typeof parsed.coins !== 'number') {
        parsed.coins = 150 + (parsed.wins || 0) * 35 + (parsed.losses || 0) * 10;
      }
      return { ...DEFAULT_STATS, ...parsed };
    }
  } catch (err) {
    console.error('Error loading Hood Tycoon stats:', err);
  }
  return DEFAULT_STATS;
}

export function recordMatchResult(
  address: string | null | undefined,
  winner: 'player' | 'bot' | 'draw',
  playerScore: number,
  botScore: number,
  coinsSpentInMatch: number = 0
): HoodTycoonCareerStats {
  if (!address || typeof window === 'undefined') return DEFAULT_STATS;

  const current = getHoodTycoonStats(address);
  const isWin = winner === 'player';
  const isLoss = winner === 'bot';
  const isDraw = winner === 'draw';

  const earnedCred = isWin ? playerScore + 25 : isDraw ? playerScore + 10 : Math.max(5, Math.floor(playerScore / 2));
  
  // 2% consolation reward of total coins spent in the match when losing!
  const consolationReward = Math.round(coinsSpentInMatch * 0.02);
  const earnedCoins = isWin ? 35 : isDraw ? 15 : consolationReward;
  
  const newWins = current.wins + (isWin ? 1 : 0);
  const newLosses = current.losses + (isLoss ? 1 : 0);
  const newDraws = current.draws + (isDraw ? 1 : 0);
  const newTotalGames = current.totalGames + 1;
  const newStreetCred = current.streetCred + earnedCred;
  const newCoins = (current.coins || 0) + earnedCoins;
  const newBestScore = Math.max(current.bestScore, playerScore);

  const newCurrentStreak = isWin ? current.currentStreak + 1 : 0;
  const newBestStreak = Math.max(current.bestStreak, newCurrentStreak);

  const matchItem: MatchHistoryItem = {
    id: `match_${Date.now()}`,
    result: isWin ? 'win' : isLoss ? 'loss' : 'draw',
    playerScore,
    botScore,
    streetCredEarned: earnedCred,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  const updated: HoodTycoonCareerStats = {
    totalGames: newTotalGames,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    streetCred: newStreetCred,
    coins: newCoins,
    bestScore: newBestScore,
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    history: [matchItem, ...current.history].slice(0, 15) // Keep last 15 matches
  };

  try {
    const key = `pfp_hood_tycoon_stats_${address.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('hood_tycoon_stats_updated', { detail: updated }));
  } catch (err) {
    console.error('Error saving Hood Tycoon stats:', err);
  }

  return updated;
}

export interface GameLeaderboardEntry {
  address: string;
  username?: string;
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  streetCred: number;
  coins: number;
  bestStreak: number;
  winRate: number;
  rankTitle: string;
  badge: string;
  isRealLocalPlayer?: boolean;
}

export function getGameLeaderboardStandings(
  holders: Array<{ address: string; username?: string; balance?: number }>,
  currentAddress?: string | null
): GameLeaderboardEntry[] {
  const standings: GameLeaderboardEntry[] = holders.map(h => {
    const isCurrent = Boolean(currentAddress && h.address.toLowerCase() === currentAddress.toLowerCase());
    
    // Fetch real recorded local career stats for this address
    const realStats = getHoodTycoonStats(h.address);
    const winRate = realStats.totalGames > 0 ? Math.round((realStats.wins / realStats.totalGames) * 100) : 0;
    const rankInfo = getRankInfo(realStats.streetCred);

    return {
      address: h.address,
      username: h.username,
      totalGames: realStats.totalGames,
      wins: realStats.wins,
      losses: realStats.losses,
      draws: realStats.draws,
      streetCred: realStats.streetCred,
      coins: realStats.coins || 150,
      bestStreak: realStats.bestStreak,
      winRate,
      rankTitle: rankInfo.title,
      badge: rankInfo.badge,
      isRealLocalPlayer: isCurrent || realStats.totalGames > 0
    };
  });

  // Sort by Street Cred descending, then by Wins descending, then by totalGames descending
  standings.sort((a, b) => {
    if (b.streetCred !== a.streetCred) {
      return b.streetCred - a.streetCred;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    return b.totalGames - a.totalGames;
  });

  return standings;
}
