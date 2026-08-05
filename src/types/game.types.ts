export type ZoneId = 'club' | 'safe' | 'street' | 'press';

export type CardRole = 'boss' | 'crew';

export interface CardStats {
  boldness: number;   // Faccia tosta (1-10)
  charisma: number;   // Parlantina / Carisma (1-10)
  blackmail: number;  // Ricatto / Caos (1-10)
}

export interface GameCard {
  id: string;                 // e.g. "PFP-717e46-77"
  name: string;               // e.g. "P.F.P 111"
  charName: string;           // e.g. "Medusa"
  season: string;             // e.g. "1", "2", "Collectibles"
  role: CardRole;
  stats: CardStats;
  abilityName: string;
  abilityDescription: string;
  imageUrl: string;
}

export interface Bribe {
  amount: number;
  isHidden: boolean;
}

export interface BlockModifier {
  id: string;
  name: string;
  icon: string;
  description: string;
  affectedZone?: ZoneId;
}

export type BotDifficulty = 'easy' | 'hard';

export interface PlayedCard {
  card: GameCard;
  playerOwner: string;        // 'player' | 'bot' | wallet address
  bribe: Bribe;
  isRevealed: boolean;
  isPetrified?: boolean;
  isDisplaced?: boolean;
  isMindControlled?: boolean;
  isRevealedEarly?: boolean;
  bribeMultiplier?: number;
  statBoost?: number;
}

export interface ZoneState {
  id: ZoneId;
  name: string;
  icon: string;
  description: string;
  playedCards: PlayedCard[];
  controlOwner: string | null;
  baseReward: number;
}

export type GamePhase = 'setup' | 'bribe' | 'negotiation' | 'reveal' | 'scoring' | 'ended';

export interface GameState {
  currentPhase: GamePhase;
  currentTurn: number;
  maxTurns: number;
  botDifficulty: BotDifficulty;
  activeModifier: BlockModifier | null;
  rivalInfo?: {
    address: string;
    username?: string | null;
  };
  playerBoss: GameCard | null;
  botBoss: GameCard | null;
  playerHand: GameCard[];
  botHand: GameCard[];
  zones: Record<ZoneId, ZoneState>;
  scores: {
    player: number;
    bot: number;
  };
  logs: string[];
  winner: string | null;
}
