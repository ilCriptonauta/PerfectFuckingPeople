'use client';

import React, { useState } from 'react';
import { GameCard, ZoneState } from '@/types/game.types';

interface BribeModalProps {
  card: GameCard;
  zone: ZoneState;
  userCoins?: number;
  onConfirm: (bribeAmount: number) => void;
  onCancel: () => void;
}

export function BribeModal({ card, zone, userCoins = 150, onConfirm, onCancel }: BribeModalProps) {
  const [bribe, setBribe] = useState<number>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const maxAllowed = Math.max(1, Math.min(10, userCoins));

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirm(bribe);
    }, 450);
  };

  return (
    <div className="bribe-modal-overlay">
      <div className="bribe-modal-box" style={{ position: 'relative' }}>
        {/* Floating Coin Burst Particles */}
        {isSubmitting && (
          <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 99,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  fontSize: '1.8rem',
                  animation: `floatUpCoin 0.6s ease-out forwards ${i * 0.06}s`
                }}
              >
                🪙
              </div>
            ))}
            <style>{`
              @keyframes floatUpCoin {
                0% { opacity: 1; transform: translate(0, 0) scale(0.6); }
                50% { opacity: 1; transform: translate(${(Math.random() - 0.5) * 120}px, -80px) scale(1.3); }
                100% { opacity: 0; transform: translate(${(Math.random() - 0.5) * 200}px, -180px) scale(0.8); }
              }
            `}</style>
          </div>
        )}
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#facc15' }}>Place Secret Bribe</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Playing <strong>{card.charName}</strong> into <strong>{zone.name}</strong>
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: 800, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* User Balance Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.15), rgba(0, 0, 0, 0.5))',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid rgba(250, 204, 21, 0.3)'
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e4e4e7' }}>Your $PFKC Balance:</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#facc15', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🪙 {userCoins} $PFKC
          </span>
        </div>

        {/* Info */}
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          <p>💰 The bribe will be played <strong>face-down</strong> alongside your character. The opponent only discovers the amount at the <em>Showdown</em>!</p>
        </div>

        {/* Range Slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
            <span>Bribe Amount:</span>
            <span style={{ color: '#facc15', fontSize: '1.1rem', fontWeight: 900 }}>🪙 {bribe} $PFKC</span>
          </div>

          <input
            type="range"
            min="1"
            max={maxAllowed}
            value={bribe}
            onChange={e => setBribe(Number(e.target.value))}
            style={{ width: '100%', height: '6px', accentColor: '#facc15', cursor: 'pointer' }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span>1 $PFKC (Budget)</span>
            <span style={{ color: userCoins - bribe < 0 ? '#f43f5e' : '#4ade80' }}>
              Remaining: 🪙 {Math.max(0, userCoins - bribe)} $PFKC
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
          <button
            onClick={onCancel}
            className="btn-secondary"
            style={{ flex: 1, padding: '10px' }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="game-btn-primary"
            style={{ flex: 1, padding: '10px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? '🪙 Paying...' : 'Confirm & Play'}
          </button>
        </div>
      </div>
    </div>
  );
}
