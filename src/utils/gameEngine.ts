import gameCardsData from '@/data/game_cards.json';
import {
  GameState,
  GameCard,
  ZoneId,
  ZoneState,
  PlayedCard,
  BlockModifier,
  BotDifficulty
} from '@/types/game.types';
import { MultiversXNFT } from '@/types/nft.types';

const allCardsMap = gameCardsData as Record<string, GameCard>;
const allCardsArray = Object.values(allCardsMap);

export const BLOCK_MODIFIERS: BlockModifier[] = [
  {
    id: 'vip_party',
    name: 'VIP Party',
    icon: '🍸',
    description: 'High society gathers at The Club. +10 bonus Pts for controlling The Club this turn.',
    affectedZone: 'club'
  },
  {
    id: 'financial_audit',
    name: 'Financial Audit',
    icon: '🏦',
    description: 'Feds audit The Vault. Bribes count as 0 power, but Vault reward increases to +25 Pts!',
    affectedZone: 'safe'
  },
  {
    id: 'street_turf_war',
    name: 'Street Turf War',
    icon: '⛓️',
    description: 'Tensions flare in The Street. Boldness stats gain a 1.5x power multiplier.',
    affectedZone: 'street'
  },
  {
    id: 'press_leak',
    name: 'Press Leak',
    icon: '📰',
    description: 'Reporters roam The Press. Bribes in The Press yield +3 extra Intel power.',
    affectedZone: 'press'
  },
  {
    id: 'crypto_rally',
    name: 'Crypto Rally',
    icon: '📈',
    description: 'Block Economy Surge! Every Bribe coin spent gives +1 extra bonus power in all zones.'
  }
];

export function getRandomBlockModifier(excludeId?: string): BlockModifier {
  const filtered = excludeId ? BLOCK_MODIFIERS.filter(m => m.id !== excludeId) : BLOCK_MODIFIERS;
  const idx = Math.floor(Math.random() * filtered.length);
  return filtered[idx];
}

export const INITIAL_ZONES: Record<ZoneId, ZoneState> = {
  club: {
    id: 'club',
    name: 'The Club',
    icon: '🍸',
    description: 'Nightlife district. Dominate here to build charisma and street influence.',
    playedCards: [],
    controlOwner: null,
    baseReward: 10
  },
  safe: {
    id: 'safe',
    name: 'The Vault',
    icon: '🏦',
    description: 'Financial hub of the block. Generates revenue from protection money.',
    playedCards: [],
    controlOwner: null,
    baseReward: 15
  },
  street: {
    id: 'street',
    name: 'The Street',
    icon: '⛓️',
    description: 'Enforcement territory. Control here intimidates and blocks rivals.',
    playedCards: [],
    controlOwner: null,
    baseReward: 12
  },
  press: {
    id: 'press',
    name: 'The Press',
    icon: '📰',
    description: 'Block media outlet. Spread propaganda to smear rival Bosses.',
    playedCards: [],
    controlOwner: null,
    baseReward: 8
  }
};

export function getRandomCard(role?: 'boss' | 'crew'): GameCard {
  const filtered = role ? allCardsArray.filter(c => c.role === role) : allCardsArray;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
}

export function convertNFTToGameCard(nft: MultiversXNFT): GameCard {
  const matched = allCardsMap[nft.identifier];
  const imageUrl = nft.media?.[0]?.url || nft.url || matched?.imageUrl || 'https://media.multiversx.com/nfts/thumbnail/PFP-717e46-18e81595';
  const pfpNum = nft.name?.match(/\d+/)?.[0] || String(nft.nonce || '0');
  
  const seasonAttr = nft.metadata?.attributes?.find(a => a.trait_type?.toLowerCase() === 'season');
  const seasonVal = seasonAttr ? String(seasonAttr.value) : (matched?.season || '1');
  const seasonLower = seasonVal.toLowerCase();

  const match = seasonLower.match(/\d+/);
  const seasonNum = match ? parseInt(match[0], 10) : 0;

  // STRICT OG CHECK: ONLY Seasons 1 to 5 are OG Bosses! Collectibles are NEVER OG!
  const isOG = !seasonLower.includes('collectible') && seasonNum >= 1 && seasonNum <= 5;

  const nonceNum = nft.nonce || parseInt(pfpNum, 10) || 1;
  const boldness = matched?.stats?.boldness ?? (5 + (nonceNum * 7) % 5);
  const charisma = matched?.stats?.charisma ?? (5 + (nonceNum * 3) % 5);
  const blackmail = matched?.stats?.blackmail ?? (5 + (nonceNum * 11) % 5);

  const charName = matched?.charName || nft.name || `Character #${pfpNum}`;
  let abilityDescription = matched?.abilityDescription || `Increases zone influence by +2 when played in matching territory.`;

  if (charName === 'The Publisher') {
    abilityDescription = 'Spies on rival hidden bribes and gains +4 Intel power in The Press.';
  } else if (charName === 'The Alien') {
    abilityDescription = 'Mind Controls rival bribe, turning their bribe coins into negative power for them!';
  } else if (charName === 'The Dreamer') {
    abilityDescription = 'Lucid Dream: Grants +5 stat boost if played in neutral or contested territory.';
  } else if (charName === 'The Bear') {
    abilityDescription = 'Bear Market Smash: Reduces rival card Boldness stat by 50%.';
  } else if (charName === 'Hot Dog Boy') {
    abilityDescription = 'Street Feast: Grants +4 bonus power to friendly crew members.';
  } else if (charName === 'The Godfather') {
    abilityDescription = 'Mafia Monopoly: Doubles the base reward of the zone where played.';
  }

  return {
    id: nft.identifier,
    name: nft.name || `P.F.P #${pfpNum}`,
    charName,
    season: seasonVal,
    role: isOG ? 'boss' : 'crew',
    stats: {
      boldness,
      charisma,
      blackmail
    },
    abilityName: matched?.abilityName || `${charName} Tactics`,
    abilityDescription,
    imageUrl
  };
}

export function createInitialStateFromNFTs(userNFTs: MultiversXNFT[], difficulty: BotDifficulty = 'easy'): GameState {
  if (!userNFTs || userNFTs.length === 0) {
    return createInitialState([], difficulty);
  }

  const playerCards = userNFTs.map(convertNFTToGameCard);
  const playerBosses = playerCards.filter(c => c.role === 'boss');
  const playerBoss = playerBosses.length > 0 ? playerBosses[0] : playerCards[0];

  const playerHand: GameCard[] = [];
  
  // 1. Put active player boss in hand slot 1
  if (playerBoss) {
    playerHand.push(playerBoss);
  }

  // 2. Add remaining user NFTs (up to 4 cards)
  const remainingPlayerCards = playerCards.filter(c => c.id !== playerBoss.id);
  for (const card of remainingPlayerCards) {
    if (playerHand.length < 4) {
      playerHand.push(card);
    }
  }

  // 3. Fill remaining slots with fillers only if user owns fewer than 4 NFTs
  const availableFillers = allCardsArray.filter(c => !playerHand.some(pc => pc.id === c.id));
  while (playerHand.length < 4 && availableFillers.length > 0) {
    const idx = Math.floor(Math.random() * availableFillers.length);
    playerHand.push(availableFillers.splice(idx, 1)[0]);
  }

  const botBoss = getRandomCard('boss');
  const botHand: GameCard[] = [];
  const availableCrewBot = allCardsArray.filter(c => c.role === 'crew');
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * availableCrewBot.length);
    botHand.push(availableCrewBot.splice(idx, 1)[0] || getRandomCard('crew'));
  }

  const initialModifier = getRandomBlockModifier();

  return {
    currentPhase: 'bribe',
    currentTurn: 1,
    maxTurns: 3,
    botDifficulty: difficulty,
    activeModifier: initialModifier,
    playerBoss,
    botBoss,
    playerHand,
    botHand,
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    scores: { player: 0, bot: 0 },
    logs: [
      `🎮 Game started! Mode: ${difficulty === 'hard' ? '🔴 Hard Boss' : '🟢 Easy'}. Connected with ${userNFTs.length} P.F.P NFT(s).`,
      `📢 Turn 1 Event: ${initialModifier.icon} ${initialModifier.name} - ${initialModifier.description}`,
      `👑 Your Active Boss: ${playerBoss.charName} (${playerBoss.name})`
    ],
    winner: null
  };
}

export function createInitialStateWithRival(
  userNFTs: MultiversXNFT[],
  rivalNFTs: MultiversXNFT[],
  rivalInfo: { address: string; username?: string | null },
  difficulty: BotDifficulty = 'easy'
): GameState {
  const baseState = createInitialStateFromNFTs(userNFTs, difficulty);
  
  if (!rivalNFTs || rivalNFTs.length === 0) {
    return {
      ...baseState,
      rivalInfo,
      logs: [
        `⚔️ Ghost Deck Match initialized vs ${rivalInfo.username ? `@${rivalInfo.username}` : rivalInfo.address.slice(0, 8)}.`,
        ...baseState.logs
      ]
    };
  }

  const rivalCards = rivalNFTs.map(convertNFTToGameCard);
  const rivalBosses = rivalCards.filter(c => c.role === 'boss');
  const botBoss = rivalBosses.length > 0 ? rivalBosses[0] : rivalCards[0];

  const botHand: GameCard[] = [];
  if (botBoss) {
    botHand.push(botBoss);
  }

  const remainingRivalCards = rivalCards.filter(c => c.id !== botBoss.id);
  for (const card of remainingRivalCards) {
    if (botHand.length < 4) {
      botHand.push(card);
    }
  }

  const availableFillers = allCardsArray.filter(c => !botHand.some(pc => pc.id === c.id));
  while (botHand.length < 4 && availableFillers.length > 0) {
    const idx = Math.floor(Math.random() * availableFillers.length);
    botHand.push(availableFillers.splice(idx, 1)[0]);
  }

  const rivalDisplayName = rivalInfo.username ? `@${rivalInfo.username}` : `${rivalInfo.address.slice(0, 6)}...${rivalInfo.address.slice(-4)}`;

  return {
    ...baseState,
    botBoss,
    botHand,
    rivalInfo,
    logs: [
      `⚔️ Rival Ghost Deck Match initialized! Challenging ${rivalDisplayName} (${rivalNFTs.length} NFTs in deck).`,
      `👑 Rival Boss: ${botBoss.charName} (${botBoss.name})`,
      ...baseState.logs.filter(l => !l.startsWith('🎮'))
    ]
  };
}

export function getPlayerCardsFromWallet(ownedNftIdentifiers: string[]): {
  bosses: GameCard[];
  crew: GameCard[];
} {
  const ownedCards = ownedNftIdentifiers
    .map(id => allCardsMap[id])
    .filter(Boolean);

  const bosses = ownedCards.filter(c => c.role === 'boss');
  const crew = ownedCards.filter(c => c.role === 'crew');

  return { bosses, crew };
}

export function createInitialState(ownedNftIds: string[] = [], difficulty: BotDifficulty = 'easy'): GameState {
  const { bosses, crew } = getPlayerCardsFromWallet(ownedNftIds);

  const playerBoss = bosses.length > 0 ? bosses[0] : getRandomCard('boss');
  const botBoss = getRandomCard('boss');

  const playerHand: GameCard[] = [];
  const availableCrewPlayer = crew.length >= 4 ? [...crew] : allCardsArray.filter(c => c.role === 'crew');
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * availableCrewPlayer.length);
    playerHand.push(availableCrewPlayer.splice(idx, 1)[0] || getRandomCard('crew'));
  }

  const botHand: GameCard[] = [];
  const availableCrewBot = allCardsArray.filter(c => c.role === 'crew');
  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * availableCrewBot.length);
    botHand.push(availableCrewBot.splice(idx, 1)[0] || getRandomCard('crew'));
  }

  const initialModifier = getRandomBlockModifier();

  return {
    currentPhase: 'bribe',
    currentTurn: 1,
    maxTurns: 3,
    botDifficulty: difficulty,
    activeModifier: initialModifier,
    playerBoss,
    botBoss,
    playerHand,
    botHand,
    zones: JSON.parse(JSON.stringify(INITIAL_ZONES)),
    scores: { player: 0, bot: 0 },
    logs: [
      `🎮 Hood Tycoon match started! Mode: ${difficulty === 'hard' ? '🔴 Hard Boss' : '🟢 Easy'}.`,
      `📢 Turn 1 Event: ${initialModifier.icon} ${initialModifier.name} - ${initialModifier.description}`
    ],
    winner: null
  };
}

export function playCardToZone(
  state: GameState,
  playerOwner: 'player' | 'bot',
  cardId: string,
  zoneId: ZoneId,
  bribeAmount: number
): GameState {
  const isPlayer = playerOwner === 'player';
  const hand = isPlayer ? [...state.playerHand] : [...state.botHand];
  const cardIndex = hand.findIndex(c => c.id === cardId);

  if (cardIndex === -1) return state;

  const [playedCardData] = hand.splice(cardIndex, 1);

  // If active modifier is "press_leak" and zone is "press", reveal early
  const isPressLeak = state.activeModifier?.id === 'press_leak' && zoneId === 'press';

  const playedCard: PlayedCard = {
    card: playedCardData,
    playerOwner,
    bribe: {
      amount: bribeAmount,
      isHidden: !isPressLeak
    },
    isRevealed: isPressLeak,
    isRevealedEarly: isPressLeak
  };

  const newZones = { ...state.zones };
  newZones[zoneId] = {
    ...newZones[zoneId],
    playedCards: [...newZones[zoneId].playedCards, playedCard]
  };

  const ownerLabel = isPlayer ? 'You' : 'Rival Bot';
  const leakText = isPressLeak ? ' (LEAKED: Played Face-Up!)' : ' with a secret bribe';
  const logMessage = `🃏 ${ownerLabel} played a character in ${newZones[zoneId].name}${leakText}.`;

  return {
    ...state,
    ...(isPlayer ? { playerHand: hand } : { botHand: hand }),
    zones: newZones,
    logs: [logMessage, ...state.logs]
  };
}

export function executeBotTurn(state: GameState): GameState {
  if (state.botHand.length === 0) return state;

  let botCard: GameCard;
  let targetZone: ZoneId;
  let bribeAmount: number;

  const zoneKeys: ZoneId[] = ['club', 'safe', 'street', 'press'];

  if (state.botDifficulty === 'hard') {
    // Tactical Bot Logic
    const targetableZones = zoneKeys.map(zId => {
      const zone = state.zones[zId];
      const playerCardCount = zone.playedCards.filter(pc => pc.playerOwner === 'player').length;
      const isModifierTarget = state.activeModifier?.affectedZone === zId;
      const priority = zone.baseReward + (playerCardCount * 12) + (isModifierTarget ? 10 : 0);
      return { zId, priority };
    }).sort((a, b) => b.priority - a.priority);

    targetZone = targetableZones[0].zId;

    const sortedHand = [...state.botHand].sort((a, b) => {
      const aPower = a.stats.boldness + a.stats.charisma + a.stats.blackmail;
      const bPower = b.stats.boldness + b.stats.charisma + b.stats.blackmail;
      return bPower - aPower;
    });
    botCard = sortedHand[0];

    const turnFactor = state.currentTurn;
    bribeAmount = Math.min(8, Math.max(2, Math.floor(Math.random() * 3) + turnFactor * 2));
  } else {
    // Easy Mode: Random
    botCard = state.botHand[Math.floor(Math.random() * state.botHand.length)];
    targetZone = zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
    bribeAmount = Math.floor(Math.random() * 5) + 1;
  }

  return playCardToZone(state, 'bot', botCard.id, targetZone, bribeAmount);
}

export function resolveTurn(state: GameState): GameState {
  const logs: string[] = ['💥 The Showdown! All cards on the table are revealed.'];
  const newZones = JSON.parse(JSON.stringify(state.zones)) as Record<ZoneId, ZoneState>;
  let roundPlayerScore = 0;
  let roundBotScore = 0;

  const modifier = state.activeModifier;

  Object.keys(newZones).forEach(key => {
    const zoneId = key as ZoneId;
    const zone = newZones[zoneId];

    if (zone.playedCards.length === 0) return;

    let currentZoneReward = zone.baseReward;

    // Apply Block Modifiers to zone reward
    if (modifier?.id === 'vip_party' && zoneId === 'club') {
      currentZoneReward += 10;
      logs.push(`🍸 VIP Party Active! The Club base reward increased to ${currentZoneReward} Pts.`);
    } else if (modifier?.id === 'financial_audit' && zoneId === 'safe') {
      currentZoneReward = 25;
      logs.push(`🏦 Financial Audit Active! The Vault base reward boosted to 25 Pts (bribes count 0).`);
    }

    // 1. Reveal all cards
    zone.playedCards.forEach(pc => {
      pc.isRevealed = true;
      pc.bribe.isHidden = false;
      logs.push(`🔍 ${pc.playerOwner === 'player' ? 'You' : 'Bot'} revealed: ${pc.card.charName} (${pc.card.name}) with a bribe of ${pc.bribe.amount} coins.`);
    });

    // 2. Trigger special abilities
    zone.playedCards.forEach(pc => {
      const charName = pc.card.charName;

      if (charName === 'Medusa') {
        const opponentCard = zone.playedCards.find(o => o.playerOwner !== pc.playerOwner);
        if (opponentCard) {
          opponentCard.isPetrified = true;
          logs.push(`🐍 Medusa petrifies ${opponentCard.card.charName}! Their influence is reduced to zero.`);
        }
      } else if (charName === 'The Promoter') {
        pc.bribeMultiplier = 2;
        logs.push(`🗣️ The Promoter doubles the bribe impact with smooth fast-talking!`);
      } else if (charName === 'Telescopius') {
        const opponentCard = zone.playedCards.find(o => o.playerOwner !== pc.playerOwner);
        if (opponentCard) {
          opponentCard.isDisplaced = true;
          logs.push(`💥 Telescopius headbutts and knocks out ${opponentCard.card.charName}!`);
        }
      } else if (charName === 'The Publisher') {
        pc.statBoost = (pc.statBoost || 0) + (zoneId === 'press' ? 4 : 2);
        logs.push(`📰 The Publisher leaks rival secrets, gaining +${pc.statBoost} Intel bonus!`);
      } else if (charName === 'The Alien') {
        const opponentCard = zone.playedCards.find(o => o.playerOwner !== pc.playerOwner);
        if (opponentCard) {
          opponentCard.isMindControlled = true;
          logs.push(`👽 The Alien Mind Controls ${opponentCard.card.charName}! Their bribe is inverted into negative power.`);
        }
      } else if (charName === 'The Dreamer') {
        pc.statBoost = (pc.statBoost || 0) + 5;
        logs.push(`🌙 The Dreamer projects Lucid Dream, gaining +5 power boost!`);
      } else if (charName === 'The Bear') {
        const opponentCard = zone.playedCards.find(o => o.playerOwner !== pc.playerOwner);
        if (opponentCard) {
          opponentCard.statBoost = (opponentCard.statBoost || 0) - Math.floor(opponentCard.card.stats.boldness / 2);
          logs.push(`🐻 The Bear intimidates ${opponentCard.card.charName}, reducing their Boldness by 50%!`);
        }
      } else if (charName === 'Hot Dog Boy') {
        zone.playedCards.forEach(friendly => {
          if (friendly.playerOwner === pc.playerOwner) {
            friendly.statBoost = (friendly.statBoost || 0) + 4;
          }
        });
        logs.push(`🌭 Hot Dog Boy feeds the crew! +4 power bonus to friendly team.`);
      } else if (charName === 'The Godfather') {
        currentZoneReward *= 2;
        logs.push(`👑 The Godfather enforces Mafia Monopoly! ${zone.name} reward doubled to ${currentZoneReward} Pts.`);
      }
    });

    // 3. Calculate scores per zone
    let playerPower = 0;
    let botPower = 0;

    zone.playedCards.forEach(pc => {
      if (pc.isPetrified || pc.isDisplaced) return;

      let boldnessStat = pc.card.stats.boldness;
      if (modifier?.id === 'street_turf_war' && zoneId === 'street') {
        boldnessStat = Math.floor(boldnessStat * 1.5);
      }

      const baseStat = boldnessStat + pc.card.stats.charisma + pc.card.stats.blackmail + (pc.statBoost || 0);
      let bribePower = pc.bribe.amount;

      if (modifier?.id === 'financial_audit' && zoneId === 'safe') {
        bribePower = 0;
      } else if (pc.isMindControlled) {
        bribePower = -pc.bribe.amount;
      } else if (modifier?.id === 'crypto_rally') {
        bribePower += pc.bribe.amount; // double value
      } else if (modifier?.id === 'press_leak' && zoneId === 'press') {
        bribePower += 3;
      }

      const multiplier = pc.bribeMultiplier || 1;
      const totalPower = Math.max(0, (baseStat + bribePower) * multiplier);

      if (pc.playerOwner === 'player') {
        playerPower += totalPower;
      } else {
        botPower += totalPower;
      }
    });

    if (playerPower > botPower) {
      zone.controlOwner = 'player';
      roundPlayerScore += currentZoneReward;
      logs.push(`🏆 You conquered ${zone.name}! (+${currentZoneReward} street points)`);
    } else if (botPower > playerPower) {
      zone.controlOwner = 'bot';
      roundBotScore += currentZoneReward;
      logs.push(`⚠️ Bot conquered ${zone.name}! (+${currentZoneReward} points for Bot)`);
    } else {
      zone.controlOwner = null;
      logs.push(`🤝 Draw in ${zone.name}. No protection money collected.`);
    }
  });

  const newScores = {
    player: state.scores.player + roundPlayerScore,
    bot: state.scores.bot + roundBotScore
  };

  const isFinalTurn = state.currentTurn >= state.maxTurns;
  let winner: string | null = null;
  let nextModifier: BlockModifier | null = null;

  if (isFinalTurn) {
    if (newScores.player > newScores.bot) {
      winner = 'player';
      logs.unshift('👑 FINAL VICTORY! You are the new King of Hood Politics!');
    } else if (newScores.bot > newScores.player) {
      winner = 'bot';
      logs.unshift('💀 FINAL DEFEAT! The rival Bot took control of the block.');
    } else {
      winner = 'draw';
      logs.unshift('⚖️ FINAL DRAW! The block remains split.');
    }
  } else {
    nextModifier = getRandomBlockModifier(state.activeModifier?.id);
    logs.unshift(`📢 Turn ${state.currentTurn + 1} Event: ${nextModifier.icon} ${nextModifier.name} - ${nextModifier.description}`);
  }

  return {
    ...state,
    currentPhase: isFinalTurn ? 'ended' : 'bribe',
    currentTurn: isFinalTurn ? state.currentTurn : state.currentTurn + 1,
    activeModifier: isFinalTurn ? state.activeModifier : nextModifier,
    zones: newZones,
    scores: newScores,
    logs: [...logs, ...state.logs],
    winner
  };
}
