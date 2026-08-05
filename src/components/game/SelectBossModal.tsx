'use client';

import React from 'react';
import { GameCard } from '@/types/game.types';
import { soundFX } from '@/utils/audioFX';

interface SelectBossModalProps {
  isOpen: boolean;
  onClose: () => void;
  ogBossCards: GameCard[];
  currentBossId: string;
  onSelectBoss: (bossCard: GameCard) => void;
}

export function SelectBossModal({
  isOpen,
  onClose,
  ogBossCards,
  currentBossId,
  onSelectBoss
}: SelectBossModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(24, 24, 37, 0.98), rgba(10, 10, 15, 0.98))',
        border: '2px solid rgba(250, 204, 21, 0.4)',
        borderRadius: '24px',
        maxWidth: '720px',
        width: '100%',
        padding: '28px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(250, 204, 21, 0.15)',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#facc15', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              👑 Choose Your Active Boss
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '4px 0 0 0' }}>
              Select which OG Boss from your wallet leads your deck and provides tactical aura boosts!
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '1rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {ogBossCards.map((boss) => {
            const isSelected = boss.id === currentBossId;

            return (
              <div
                key={boss.id}
                onClick={() => {
                  soundFX.playCardFlip();
                  onSelectBoss(boss);
                }}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.18), rgba(0,0,0,0.8))'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected 
                    ? '2px solid #facc15' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(250, 204, 21, 0.3)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center'
                }}
              >
                {/* Image */}
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '12px',
                  border: '2px solid rgba(250, 204, 21, 0.3)',
                  position: 'relative'
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={boss.imageUrl}
                    alt={boss.charName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: '#facc15',
                      color: '#000',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '0.7rem',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      ✓
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', margin: '0 0 4px 0' }}>
                  {boss.charName}
                </h3>
                <div style={{ fontSize: '0.72rem', color: '#a1a1aa', margin: '0 0 8px 0' }}>
                  {boss.name}
                </div>

                {/* Ability */}
                <div style={{
                  fontSize: '0.72rem',
                  color: '#facc15',
                  fontWeight: 700,
                  background: 'rgba(250, 204, 21, 0.1)',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  ⚡ {boss.abilityName}
                </div>

                {/* Action Button */}
                <button
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: isSelected ? 'none' : '1px solid rgba(250, 204, 21, 0.4)',
                    background: isSelected ? '#facc15' : 'rgba(250, 204, 21, 0.15)',
                    color: isSelected ? '#000' : '#facc15'
                  }}
                >
                  {isSelected ? '👑 Active Boss' : 'Select Boss'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            className="btn-action btn-action-primary"
            style={{ padding: '8px 24px', fontSize: '0.85rem' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
