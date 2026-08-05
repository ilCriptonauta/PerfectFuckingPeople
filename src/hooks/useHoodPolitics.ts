import { useState, useCallback, useEffect } from 'react';
import {
  GameState,
  ZoneId,
  GameCard,
  BotDifficulty
} from '@/types/game.types';
import { MultiversXNFT } from '@/types/nft.types';
import {
  createInitialStateFromNFTs,
  createInitialStateWithRival,
  playCardToZone,
  executeBotTurn,
  resolveTurn
} from '@/utils/gameEngine';

export function useHoodPolitics(userNFTs: MultiversXNFT[] = [], rivalAddress?: string | null) {
  const [difficulty, setDifficulty] = useState<BotDifficulty>('easy');
  const [rivalNFTs, setRivalNFTs] = useState<MultiversXNFT[]>([]);
  const [rivalUsername, setRivalUsername] = useState<string | null>(null);
  const [isRivalLoading, setIsRivalLoading] = useState<boolean>(false);

  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialStateFromNFTs(userNFTs, 'easy')
  );
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);

  const nftIdsKey = userNFTs ? userNFTs.map(n => n.identifier).sort().join(',') : '';

  // Fetch Rival data if rivalAddress is present
  useEffect(() => {
    if (!rivalAddress) return;

    let isSubscribed = true;
    const controller = new AbortController();

    queueMicrotask(() => {
      setIsRivalLoading(true);
    });

    // 1. Fetch Rival Herotag
    fetch(`https://api.multiversx.com/accounts/${rivalAddress}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (isSubscribed && data && data.username) {
          const cleanName = String(data.username).replace(/\.elrond$/, "");
          setRivalUsername(cleanName);
        }
      })
      .catch(() => {});

    // 2. Fetch Rival NFTs
    fetch(`https://api.multiversx.com/accounts/${rivalAddress}/nfts?collection=PFP-717e46&size=100`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (isSubscribed && Array.isArray(data)) {
          setRivalNFTs(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isSubscribed) {
          setIsRivalLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [rivalAddress]);

  useEffect(() => {
    queueMicrotask(() => {
      if (rivalAddress) {
        setGameState(createInitialStateWithRival(
          userNFTs,
          rivalNFTs,
          { address: rivalAddress, username: rivalUsername },
          difficulty
        ));
      } else {
        setGameState(createInitialStateFromNFTs(userNFTs, difficulty));
      }
      setSelectedCard(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nftIdsKey, rivalAddress, rivalNFTs.length, rivalUsername]);

  const startNewGame = useCallback((overrideDifficulty?: BotDifficulty) => {
    const diff = overrideDifficulty || difficulty;
    if (rivalAddress) {
      setGameState(createInitialStateWithRival(
        userNFTs,
        rivalNFTs,
        { address: rivalAddress, username: rivalUsername },
        diff
      ));
    } else {
      setGameState(createInitialStateFromNFTs(userNFTs, diff));
    }
    setSelectedCard(null);
  }, [userNFTs, rivalNFTs, rivalAddress, rivalUsername, difficulty]);

  const toggleDifficulty = useCallback(() => {
    const nextDiff: BotDifficulty = difficulty === 'easy' ? 'hard' : 'easy';
    setDifficulty(nextDiff);
    startNewGame(nextDiff);
  }, [difficulty, startNewGame]);

  const selectCardToPlay = useCallback((card: GameCard | null) => {
    setSelectedCard(card);
  }, []);

  const handlePlayCard = useCallback(
    (zoneId: ZoneId, bribeAmount: number) => {
      if (!selectedCard) return;

      // 1. Play player's card
      let updatedState = playCardToZone(
        gameState,
        'player',
        selectedCard.id,
        zoneId,
        bribeAmount
      );

      // 2. Execute Bot's turn
      updatedState = executeBotTurn(updatedState);

      setGameState(updatedState);
      setSelectedCard(null);
    },
    [gameState, selectedCard]
  );

  const handleResolveTurn = useCallback(() => {
    setGameState(prev => resolveTurn(prev));
  }, []);

  const changeActiveBoss = useCallback((bossCard: GameCard) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      // Re-order player hand so new boss is in slot #1
      const otherHandCards = prev.playerHand.filter(c => c.id !== bossCard.id);
      const newHand = [bossCard, ...otherHandCards].slice(0, 4);

      return {
        ...prev,
        playerBoss: bossCard,
        playerHand: newHand,
        logs: [
          `👑 Active Boss changed to ${bossCard.charName}! Tactical aura updated.`,
          ...prev.logs
        ]
      };
    });
  }, []);

  return {
    gameState,
    selectedCard,
    difficulty,
    isRivalLoading,
    rivalUsername,
    toggleDifficulty,
    selectCardToPlay,
    handlePlayCard,
    handleResolveTurn,
    startNewGame,
    changeActiveBoss
  };
}
