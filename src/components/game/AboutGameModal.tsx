'use client';

import React from 'react';

interface AboutGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutGameModal({ isOpen, onClose }: AboutGameModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          backgroundColor: '#09090b',
          border: '2px solid #eab308',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(234, 179, 8, 0.3)',
          overflowY: 'auto',
          color: '#fff',
          padding: '24px',
          position: 'relative',
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ✕
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
          <div style={{ fontSize: '2rem', background: 'rgba(234, 179, 8, 0.2)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.4)' }}>
            👑
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#facc15', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Hood Tycoon • Rules & Guide
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: '2px 0 0 0' }}>
              Tactical Block Control Overview
            </p>
          </div>
        </div>

        {/* Modal Content Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem', lineHeight: '1.5', color: '#d4d4d8' }}>
          {/* Section 1: Objective */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#facc15', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎯</span> Game Objective
            </h3>
            <p style={{ margin: 0 }}>
              Dominate the 4 city territories (<strong>The Club</strong>, <strong>The Vault</strong>, <strong>The Street</strong>, <strong>The Press</strong>) across 3 tactical turns. Control zones to accumulate influence points and become the Don of Hood Tycoon!
            </p>
          </div>

          {/* Section 2: How to Play */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#facc15', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🕹️</span> How to Play (Turn Sequence)
            </h3>
            <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Select a Card</strong>: Pick a character from your hand (Boss or Crew).</li>
              <li><strong>Target a Zone</strong>: Click any territory to play your card face-down.</li>
              <li><strong>Bribe Option</strong>: Add optional bribes to boost your influence power.</li>
              <li><strong>Rival Turn</strong>: The Rival Bot will immediately play its secret card.</li>
              <li><strong>Showdown</strong>: Click <strong>SHOWDOWN</strong> to reveal cards, trigger abilities, and calculate control points!</li>
            </ol>
          </div>

          {/* Section 3: Cards & Attributes */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 900, color: '#facc15', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🎴</span> Card Categories & Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: '#facc15', fontWeight: 800 }}>🟡 OG Bosses (Gold Border)</span>: High stats & game-changing tactical abilities.
              </div>
              <div>
                <span style={{ color: '#38bdf8', fontWeight: 800 }}>🩵 Collectibles (Sky Blue Border)</span>: Versatile support crew characters.
              </div>
              <div style={{ background: 'rgba(0, 0, 0, 0.5)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>😎 Boldness</span>
                <span>🗣️ Charisma</span>
                <span>🕵️ Blackmail</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(to right, #ca8a04, #eab308)',
              color: '#000',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '0.9rem',
              fontWeight: 900,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            Got It! Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
