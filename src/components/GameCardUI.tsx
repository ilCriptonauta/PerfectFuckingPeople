'use client';

import React, { useState } from 'react';
import { GameCard } from '@/types/game.types';
import { soundFX } from '@/utils/audioFX';

interface GameCardUIProps {
  card: GameCard;
  isSelected?: boolean;
  isRevealed?: boolean;
  isPetrified?: boolean;
  isDisplaced?: boolean;
  onClick?: () => void;
  small?: boolean;
  enableFlip?: boolean;
}

export function GameCardUI({
  card,
  isSelected = false,
  isRevealed = true,
  isPetrified = false,
  isDisplaced = false,
  onClick,
  small = false,
  enableFlip = true
}: GameCardUIProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const seasonStr = String(card.season || '').toLowerCase();
  const seasonMatch = seasonStr.match(/\d+/);
  const seasonNum = seasonMatch ? parseInt(seasonMatch[0], 10) : 0;
  const isOG = !seasonStr.includes('collectible') && seasonNum >= 1 && seasonNum <= 5;

  // Border & Glow styling based on OG (Yellow #facc15) vs Collectible (Sky Blue #38bdf8)
  const borderColorClass = isOG 
    ? 'border-yellow-400/90 shadow-[0_0_20px_rgba(250,204,21,0.25)]' 
    : 'border-sky-400/90 shadow-[0_0_20px_rgba(56,189,248,0.25)]';

  const selectedGlowClass = isSelected
    ? isOG
      ? 'ring-4 ring-yellow-400 border-yellow-400 shadow-[0_0_35px_rgba(250,204,21,0.9)] scale-105 z-20'
      : 'ring-4 ring-sky-400 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.9)] scale-105 z-20'
    : '';

  const badgeBgStyle = isOG
    ? { background: '#facc15', color: '#000' }
    : { background: '#38bdf8', color: '#000' };

  if (!isRevealed) {
    return (
      <div
        onClick={onClick}
        style={{
          width: small ? '150px' : '220px',
          height: small ? '210px' : '310px',
          minWidth: small ? '150px' : '220px',
          minHeight: small ? '210px' : '310px',
          background: 'linear-gradient(145deg, #18181b 0%, #09090b 50%, #1e1b4b 100%)',
          border: '2px solid #eab308',
          borderRadius: '18px',
          padding: '8px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.8), 0 0 20px rgba(234, 179, 8, 0.25)',
          cursor: 'pointer',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Inner Gold Box Frame */}
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: '14px',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          background: 'rgba(0, 0, 0, 0.75)',
          padding: '12px 10px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Top Row Accent */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            color: '#fde047',
            letterSpacing: '1px',
            fontFamily: 'monospace'
          }}>
            <span>◆</span>
            <span>SECRET</span>
            <span>◆</span>
          </div>

          {/* Center P.F.P Shield Emblem */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            margin: 'auto 0'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #78350f, #ca8a04, #581c87)',
              border: '2px solid #facc15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 0 15px rgba(250, 204, 21, 0.4)'
            }}>
              👑
            </div>

            <h3 style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#facc15',
              letterSpacing: '2px',
              margin: '6px 0 0 0',
              textShadow: '0 2px 10px rgba(250, 204, 21, 0.5)'
            }}>
              P.F.P
            </h3>

            <span style={{
              color: '#d8b4fe',
              fontSize: '0.65rem',
              fontWeight: 800,
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              Hood Politics
            </span>
          </div>

          {/* Bottom Row Accent */}
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.65rem',
            fontWeight: 'bold',
            color: 'rgba(250, 204, 21, 0.7)',
            fontFamily: 'monospace'
          }}>
            <span>CLASSIFIED</span>
            <span>🔒</span>
          </div>
        </div>
      </div>
    );
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (isFlipped) {
      e.stopPropagation();
      soundFX.playCardFlip();
      setIsFlipped(false);
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  const handleFlipToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundFX.playCardFlip();
    setIsFlipped(!isFlipped);
  };

  const pfpNumber = card.name.match(/\d+/)?.[0] || '0';

  return (
    <div
      style={{
        width: small ? '150px' : '220px',
        height: small ? '210px' : '310px',
        minWidth: small ? '150px' : '220px',
        minHeight: small ? '210px' : '310px',
      }}
      className={`nft-card-perspective cursor-pointer ${isFlipped ? 'flipped' : ''} ${selectedGlowClass}`}
      onClick={handleCardClick}
    >
      <div className="nft-card-inner" style={{ height: '100%' }}>
        {/* FRONT */}
        <div
          className={`nft-card-front flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-300 ${borderColorClass} ${
            isPetrified ? 'grayscale contrast-125 opacity-75' : ''
          }`}
          style={{ height: '100%', padding: 0, background: '#09090b' }}
        >
          {/* 1:1 Image Box */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1/1',
            background: '#000',
            overflow: 'hidden'
          }}>
            <img
              src={card.imageUrl}
              alt={card.charName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />

            {/* Top Right #ID Badge */}
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(4px)',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: small ? '0.75rem' : '0.85rem',
              fontWeight: 900,
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              zIndex: 5
            }}>
              #{pfpNumber}
            </div>

            {/* Top Left Role Badge */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              ...badgeBgStyle,
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: small ? '0.65rem' : '0.75rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              zIndex: 5
            }}>
              {isOG ? 'OG Boss' : 'Collectible'}
            </div>

            {isPetrified && (
              <div className="absolute inset-0 bg-stone-900/80 flex items-center justify-center z-10">
                <span className="text-xs font-black uppercase text-stone-200 bg-stone-950 px-2 py-1 rounded border border-stone-400">
                  🗿 Petrified
                </span>
              </div>
            )}
          </div>

          {/* Bottom Title Bar */}
          <div style={{
            padding: small ? '8px 10px' : '10px 12px',
            background: 'linear-gradient(to top, #09090b, #18181b)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '6px',
            textAlign: 'left',
            flex: 1
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{
                fontSize: small ? '0.85rem' : '1rem',
                fontWeight: 900,
                color: '#fff',
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.2
              }}>
                {card.charName}
              </h3>
              <p style={{
                color: isOG ? '#fde047' : '#38bdf8',
                fontSize: small ? '0.65rem' : '0.75rem',
                fontWeight: 700,
                margin: '2px 0 0 0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {isOG ? 'OG Collection' : 'Season Collectibles'}
              </p>
            </div>

            {enableFlip && (
              <button
                onClick={handleFlipToggle}
                style={{
                  background: isOG ? 'rgba(250, 204, 21, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: isOG ? '#fde047' : '#38bdf8',
                  border: isOG ? '1px solid rgba(250, 204, 21, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: small ? '0.7rem' : '0.75rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                title="Flip card for stats"
              >
                <span>↻</span>
                <span>INFO</span>
              </button>
            )}
          </div>
        </div>

        {/* BACK (Clear 1-Row Header, Full Ability, Always Visible Stats & Flip Bar) */}
        <div
          className={`nft-card-back flex flex-col justify-between rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-black border-2 ${borderColorClass} text-left shadow-2xl cursor-pointer`}
          style={{
            height: '100%',
            padding: small ? '10px' : '14px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onClick={handleCardClick}
        >
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              {/* Clean Single Row Back Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                paddingBottom: '6px',
                marginBottom: '8px'
              }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h4 style={{
                    color: isOG ? '#facc15' : '#38bdf8',
                    fontSize: small ? '0.85rem' : '1rem',
                    fontWeight: 900,
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {card.charName}
                  </h4>
                  <p style={{
                    color: '#a1a1aa',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    margin: '2px 0 0 0'
                  }}>
                    {isOG ? 'OG Boss • Season 1-5' : 'Collectible • Season 6'}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  fontWeight: 'bold',
                  color: '#fff',
                  background: 'rgba(0, 0, 0, 0.7)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  marginLeft: '6px',
                  flexShrink: 0
                }}>
                  #{pfpNumber}
                </span>
              </div>

              {/* Special Ability Box */}
              <div style={{
                background: isOG ? 'rgba(250, 204, 21, 0.08)' : 'rgba(56, 189, 248, 0.08)',
                border: isOG ? '1px solid rgba(250, 204, 21, 0.3)' : '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '10px',
                padding: small ? '8px' : '10px',
                marginBottom: '8px'
              }}>
                <div style={{
                  color: isOG ? '#facc15' : '#38bdf8',
                  fontSize: small ? '0.75rem' : '0.8rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '4px'
                }}>
                  <span>⚡</span> {card.abilityName}
                </div>
                <p style={{
                  color: '#e4e4e7',
                  fontSize: small ? '0.68rem' : '0.72rem',
                  lineHeight: '1.3',
                  margin: 0
                }}>
                  {card.abilityDescription}
                </p>
              </div>

              {/* Game Stats (Always 100% Fully Visible) */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: small ? '8px' : '10px',
                fontSize: small ? '0.75rem' : '0.8rem',
                fontFamily: 'monospace',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#d4d4d8' }}>😎 Boldness:</span>
                  <strong style={{ color: isOG ? '#facc15' : '#38bdf8', fontSize: '0.85rem' }}>{card.stats.boldness}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#d4d4d8' }}>🗣️ Charisma:</span>
                  <strong style={{ color: isOG ? '#facc15' : '#38bdf8', fontSize: '0.85rem' }}>{card.stats.charisma}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#d4d4d8' }}>🕵️ Blackmail:</span>
                  <strong style={{ color: isOG ? '#facc15' : '#38bdf8', fontSize: '0.85rem' }}>{card.stats.blackmail}</strong>
                </div>
              </div>
            </div>

            {/* Back Footer */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                paddingTop: '8px',
                marginTop: '6px',
                color: isOG ? '#facc15' : '#38bdf8',
                fontSize: '0.7rem',
                fontWeight: 900,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                width: '100%',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>↩</span> TAP TO FLIP BACK
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

