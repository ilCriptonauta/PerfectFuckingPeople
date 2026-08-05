'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/out/react/account/useGetAccountInfo';
import { GameState, ZoneState, GameCard, ZoneId } from '@/types/game.types';
import { GameCardUI } from './GameCardUI';
import { BribeModal } from './BribeModal';
import { AboutGameModal } from './AboutGameModal';
import { SelectBossModal } from './SelectBossModal';
import { recordMatchResult, getHoodTycoonStats } from '@/utils/hoodTycoonStats';
import { soundFX } from '@/utils/audioFX';

interface GameBoardUIProps {
  gameState: GameState;
  selectedCard: GameCard | null;
  onSelectCard: (card: GameCard | null) => void;
  onPlayCard: (zoneId: ZoneId, bribeAmount: number) => void;
  onResolveTurn: () => void;
  onRestart: () => void;
  onToggleDifficulty?: () => void;
  onChangeActiveBoss?: (bossCard: GameCard) => void;
}

export function GameBoardUI({
  gameState,
  selectedCard,
  onSelectCard,
  onPlayCard,
  onResolveTurn,
  onRestart,
  onToggleDifficulty,
  onChangeActiveBoss
}: GameBoardUIProps) {
  const [targetZone, setTargetZone] = useState<ZoneState | null>(null);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSelectBossOpen, setIsSelectBossOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => soundFX.isMuted());

  const searchParams = useSearchParams();
  const simulateAddress = searchParams.get('simulate');

  const { address } = useGetAccountInfo();
  const recordedMatchRef = useRef<string | null>(null);
  const totalCoinsSpentInMatchRef = useRef<number>(0);

  const [userCoins, setUserCoins] = useState<number>(() => getHoodTycoonStats(address).coins || 150);

  useEffect(() => {
    const handleMuteChange = (e: CustomEvent<boolean>) => {
      setIsMuted(e.detail);
    };
    window.addEventListener('pfp_sound_mute_changed', handleMuteChange as EventListener);
    return () => {
      window.removeEventListener('pfp_sound_mute_changed', handleMuteChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (address) {
      queueMicrotask(() => {
        setUserCoins(getHoodTycoonStats(address).coins || 150);
      });
    }
  }, [address]);

  useEffect(() => {
    if (gameState.winner && recordedMatchRef.current !== `${gameState.winner}-${gameState.currentTurn}`) {
      recordedMatchRef.current = `${gameState.winner}-${gameState.currentTurn}`;

      const updated = recordMatchResult(
        address,
        gameState.winner as 'player' | 'bot' | 'draw',
        gameState.scores.player,
        gameState.scores.bot,
        totalCoinsSpentInMatchRef.current
      );
      if (updated && updated.coins) {
        queueMicrotask(() => {
          setUserCoins(updated.coins);
        });
      }

      if (gameState.winner === 'player') {
        soundFX.playVictory();
      } else if (gameState.winner === 'bot') {
        soundFX.playDefeat();
      }
    }
  }, [gameState.winner, gameState.currentTurn, gameState.scores.player, address]);

  const handleToggleSound = () => {
    const nextMuted = soundFX.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleZoneClick = (zone: ZoneState) => {
    if (!selectedCard || gameState.currentPhase === 'ended') return;
    setTargetZone(zone);
  };

  const handleConfirmBribe = (bribeAmount: number) => {
    if (!targetZone) return;
    if (bribeAmount > 0) {
      soundFX.playBribeCoins();
      totalCoinsSpentInMatchRef.current += bribeAmount;
      setUserCoins(prev => Math.max(0, prev - bribeAmount));
    } else {
      soundFX.playCardPlay();
    }
    onPlayCard(targetZone.id, bribeAmount);
    setTargetZone(null);
  };

  const handleShowdownClick = () => {
    soundFX.playShowdown();
    onResolveTurn();
  };

  const hasPlayedAnyCard = Object.values(gameState.zones).some(z => z.playedCards.length > 0);

  return (
    <div className="game-container">
      {/* 1. Top Navigation & System Control Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {/* Left: Back Navigation Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href={`/gallery/profile${simulateAddress ? `?simulate=${simulateAddress}` : ''}`}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: '#facc15',
              borderColor: 'rgba(250, 204, 21, 0.4)',
              background: 'rgba(250, 204, 21, 0.1)',
              padding: '8px 14px',
              borderRadius: '10px',
              textDecoration: 'none'
            }}
          >
            ← Profile
          </Link>

          <Link
            href={simulateAddress ? `/gallery?simulate=${simulateAddress}` : "/gallery"}
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              padding: '8px 14px',
              borderRadius: '10px',
              textDecoration: 'none'
            }}
          >
            🖼️ Gallery
          </Link>

          <Link
            href="/gallery/leaderboard"
            className="btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.85rem',
              color: '#facc15',
              borderColor: 'rgba(250, 204, 21, 0.3)',
              background: 'rgba(250, 204, 21, 0.08)',
              padding: '8px 14px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700
            }}
          >
            👑 Leaderboard
          </Link>

          {gameState.rivalInfo && (
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(0, 0, 0, 0.7))',
              color: '#facc15',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              ⚔️ Ghost Deck Match: {gameState.rivalInfo.username ? `@${gameState.rivalInfo.username}` : `Rival ${gameState.rivalInfo.address.slice(0, 6)}`}
            </span>
          )}
        </div>

        {/* Right: System Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleToggleSound} className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
            {isMuted ? '🔇 Audio OFF' : '🔊 Audio ON'}
          </button>
          <button onClick={() => setIsRulesOpen(true)} className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem', borderColor: 'rgba(250, 204, 21, 0.3)', color: '#fde047' }}>
            📖 About Game
          </button>
          <button onClick={onRestart} className="btn-secondary" style={{ padding: '7px 12px', fontSize: '0.8rem' }}>
            🔄 New Game
          </button>
        </div>
      </div>

      {/* 2. Main Match Dashboard Banner */}
      <div className="game-header" style={{ marginBottom: '1.25rem', padding: '16px 20px', borderRadius: '18px' }}>
        <div className="game-title-group">
          <div className="game-icon-badge">👑</div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
              Hood Tycoon
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Turn {gameState.currentTurn} of {gameState.maxTurns} • Block Control
            </p>
          </div>
        </div>

        {/* Center Scoreboard */}
        <div className="game-score-board">
          <div className="score-box">
            <span className="score-label">You</span>
            <div className="score-val-player">{gameState.scores.player} Pts</div>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 800, padding: '0 8px' }}>VS</div>
          <div className="score-box">
            <span className="score-label">
              {gameState.rivalInfo ? (gameState.rivalInfo.username ? `@${gameState.rivalInfo.username}` : `Rival ${gameState.rivalInfo.address.slice(0, 6)}`) : 'Rival Bot'}
            </span>
            <div className="score-val-bot">{gameState.scores.bot} Pts</div>
          </div>
        </div>

        {/* Right Dashboard Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(0, 0, 0, 0.6))',
            border: '1px solid rgba(250, 204, 21, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 12px rgba(250, 204, 21, 0.2)'
          }}>
            <span style={{ fontSize: '0.9rem' }}>🪙</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#facc15' }}>{userCoins} $PFKC</span>
          </div>

          {onToggleDifficulty && (
            <button
              onClick={onToggleDifficulty}
              className="btn-secondary"
              style={{
                padding: '6px 12px',
                fontSize: '0.8rem',
                borderColor: gameState.botDifficulty === 'hard' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)',
                color: gameState.botDifficulty === 'hard' ? '#f87171' : '#4ade80'
              }}
            >
              {gameState.botDifficulty === 'hard' ? '🔴 Hard Boss' : '🟢 Easy'}
            </button>
          )}

          {gameState.currentPhase !== 'ended' && hasPlayedAnyCard && (
            <button onClick={handleShowdownClick} className="game-btn-primary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
              💥 Showdown
            </button>
          )}
        </div>
      </div>

      {/* Active Turn Block Modifier Banner */}
      {gameState.activeModifier && (
        <div style={{
          padding: '10px 16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(30, 27, 75, 0.8))',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 0 20px rgba(147, 51, 234, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>{gameState.activeModifier.icon}</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Turn {gameState.currentTurn} Event: {gameState.activeModifier.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#e4e4e7', marginTop: '2px' }}>
                {gameState.activeModifier.description}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.25)', color: '#e9d5ff', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
            ACTIVE EVENT
          </span>
        </div>
      )}

      {/* Winners Banner */}
      {gameState.winner && (
        <div style={{
          padding: '1.5rem',
          borderRadius: '16px',
          textAlign: 'center',
          background: gameState.winner === 'player' ? 'rgba(16, 185, 129, 0.15)' : gameState.winner === 'bot' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          border: `1px solid ${gameState.winner === 'player' ? '#10b981' : gameState.winner === 'bot' ? '#f43f5e' : 'var(--border)'}`
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: gameState.winner === 'player' ? '#10b981' : gameState.winner === 'bot' ? '#f43f5e' : '#fff' }}>
            {gameState.winner === 'player' ? '👑 VICTORY! You are the Don of Hood Tycoon!' : gameState.winner === 'bot' ? '💀 DEFEAT! The Bot controls the city.' : '⚖️ DRAW!'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Final Score: You ({gameState.scores.player}) - Bot ({gameState.scores.bot})
          </p>
        </div>
      )}

      {/* Main Game Grid: 4 Zones in 2x2 Landscape Rectangles */}
      <div className="game-zones-grid">
        {Object.values(gameState.zones).map(zone => {
          const isTargetable = Boolean(selectedCard);

          const DISTRICT_BACKGROUNDS: Record<string, string> = {
            club: '/images/districts/club.png',
            safe: '/images/districts/vault.png',
            street: '/images/districts/street.png',
            press: '/images/districts/press.png'
          };
          const bgUrl = DISTRICT_BACKGROUNDS[zone.id];

          let zoneClass = 'zone-card';
          if (zone.controlOwner === 'player') zoneClass += ' player-control';
          else if (zone.controlOwner === 'bot') zoneClass += ' bot-control';
          if (isTargetable) zoneClass += ' targetable';

          return (
            <div
              key={zone.id}
              onClick={() => handleZoneClick(zone)}
              className={zoneClass}
              style={{
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '18px 22px',
                borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(16, 16, 26, 0.94), rgba(8, 8, 14, 0.96))',
                border: isTargetable 
                  ? '2px solid rgba(250, 204, 21, 0.85)' 
                  : zone.controlOwner === 'player'
                  ? '1px solid rgba(74, 222, 128, 0.5)'
                  : zone.controlOwner === 'bot'
                  ? '1px solid rgba(248, 113, 113, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isTargetable ? '0 0 30px rgba(250, 204, 21, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.5)',
                cursor: isTargetable ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
              }}
            >
              {/* Gritty Comic Illustration Background Overlay ("The Boys" Art Style) */}
              {bgUrl && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${bgUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.24,
                    mixBlendMode: 'luminosity',
                    pointerEvents: 'none',
                    zIndex: 0
                  }}
                />
              )}

              {/* District Content Layer */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Rectangle Zone Header Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}>{zone.icon}</span>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                        {zone.name}
                      </h3>
                      <p style={{ fontSize: '0.74rem', color: '#d4d4d8', margin: '2px 0 0 0', lineHeight: 1.3, textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                        {zone.description}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 900, padding: '4px 10px', borderRadius: '12px', background: 'rgba(250, 204, 21, 0.2)', color: '#facc15', border: '1px solid rgba(250, 204, 21, 0.5)', backdropFilter: 'blur(4px)' }}>
                      +{zone.baseReward} Pts
                    </span>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backdropFilter: 'blur(4px)',
                      background: zone.controlOwner === 'player' ? 'rgba(74, 222, 128, 0.2)' : zone.controlOwner === 'bot' ? 'rgba(248, 113, 113, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: zone.controlOwner === 'player' ? '#4ade80' : zone.controlOwner === 'bot' ? '#f87171' : '#e4e4e7',
                      border: zone.controlOwner === 'player' ? '1px solid rgba(74, 222, 128, 0.5)' : zone.controlOwner === 'bot' ? '1px solid rgba(248, 113, 113, 0.5)' : '1px solid rgba(255, 255, 255, 0.15)'
                    }}>
                      {zone.controlOwner === 'player' ? '🟢 Controlled' : zone.controlOwner === 'bot' ? '🔴 Bot Controlled' : '⚪ Neutral'}
                    </span>
                  </div>
                </div>

              {/* Cards Played Arena Inside Rectangle */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: isTargetable ? '1px dashed rgba(250, 204, 21, 0.6)' : '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '14px',
                padding: '12px 16px',
                minHeight: '125px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: zone.playedCards.length === 0 ? 'center' : 'flex-start',
                gap: '12px',
                overflowX: 'auto'
              }}>
                {zone.playedCards.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '8px' }}>
                    <span style={{ fontSize: '0.82rem', color: isTargetable ? '#facc15' : 'var(--text-secondary)', fontWeight: isTargetable ? 800 : 500 }}>
                      {isTargetable ? '👇 Click here to play selected card in ' + zone.name : '⚪ No cards played in ' + zone.name + ' yet'}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                    {zone.playedCards.map((pc, idx) => (
                      <GameCardUI
                        key={idx}
                        card={pc.card}
                        isRevealed={pc.isRevealed}
                        isPetrified={pc.isPetrified}
                        isDisplaced={pc.isDisplaced}
                        small
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Player Hand Section */}
      <div className="hand-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
              Your Hand (Crew & Boss)
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {selectedCard ? 'Select a zone above to play this card face-down!' : 'Click a card to select and play it.'}
            </p>
          </div>

          {gameState.playerBoss && (
            <button
              onClick={() => {
                soundFX.playCardFlip();
                setIsSelectBossOpen(true);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(0,0,0,0.6))',
                border: '1px solid rgba(250, 204, 21, 0.5)',
                fontSize: '0.82rem',
                fontWeight: 800,
                color: '#facc15',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(250, 204, 21, 0.15)',
                transition: 'all 0.2s ease'
              }}
              title="Click to switch your Active Boss"
            >
              <span>👑 Boss: {gameState.playerBoss.charName}</span>
              {gameState.playerHand.filter(c => c.role === 'boss').length > 1 && (
                <span style={{ fontSize: '0.72rem', background: 'rgba(250,204,21,0.2)', padding: '2px 6px', borderRadius: '6px', border: '1px solid rgba(250,204,21,0.3)' }}>
                  Change 🔄
                </span>
              )}
            </button>
          )}
        </div>

        {/* Hand Cards */}
        <div className="hand-cards-row">
          {gameState.playerHand.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '16px 0' }}>
              You played all cards in your hand for this turn.
            </p>
          ) : (
            gameState.playerHand.map(card => (
              <GameCardUI
                key={card.id}
                card={card}
                isSelected={selectedCard?.id === card.id}
                onClick={() => {
                  soundFX.playCardFlip();
                  onSelectCard(selectedCard?.id === card.id ? null : card);
                }}
              />
            ))
          )}
        </div>
      </div>

      {/* Game Logs */}
      <div className="game-logs-box">
        <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Block Events Log
        </div>
        {gameState.logs.map((log, idx) => (
          <div key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '2px' }}>
            {log}
          </div>
        ))}
      </div>

      {/* Bribe Modal */}
      {selectedCard && targetZone && (
        <BribeModal
          card={selectedCard}
          zone={targetZone}
          userCoins={userCoins}
          onConfirm={handleConfirmBribe}
          onCancel={() => setTargetZone(null)}
        />
      )}

      {/* About Game & Rules Modal */}
      <AboutGameModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Choose Active Boss Modal */}
      <SelectBossModal
        isOpen={isSelectBossOpen}
        onClose={() => setIsSelectBossOpen(false)}
        ogBossCards={gameState.playerHand.filter(c => c.role === 'boss')}
        currentBossId={gameState.playerBoss?.id || ''}
        onSelectBoss={(bossCard) => {
          if (onChangeActiveBoss) {
            onChangeActiveBoss(bossCard);
          }
          setIsSelectBossOpen(false);
        }}
      />
    </div>
  );
}
