'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetIsLoggedIn } from '@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn';
import { useWalletNFTs, COLLECTION_ID } from '@/hooks/useWalletNFTs';
import { useHoodPolitics } from '@/hooks/useHoodPolitics';
import { GameBoardUI } from '@/components/game/GameBoardUI';
import { ConnectButton } from '@/components/ConnectButton';

function GameContent() {
  const isLoggedIn = useGetIsLoggedIn();
  const searchParams = useSearchParams();
  const simulateAddress = searchParams.get('simulate');
  const rivalAddress = searchParams.get('rival');
  const isSimulating = Boolean(simulateAddress);

  const { nfts, isLoading, address } = useWalletNFTs(simulateAddress || undefined);

  const {
    gameState,
    selectedCard,
    toggleDifficulty,
    selectCardToPlay,
    handlePlayCard,
    handleResolveTurn,
    startNewGame,
    changeActiveBoss
  } = useHoodPolitics(nfts, rivalAddress);

  // 1. Loading State
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #09090b 70%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '20px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          border: '4px solid #facc15',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#facc15', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
          Scanning MultiversX Wallet...
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#a1a1aa', marginTop: '8px' }}>
          Verifying collection {COLLECTION_ID} on-chain
        </p>
      </div>
    );
  }

  // 2. Not Logged In State (AAA Home Page Aesthetic)
  if (!isLoggedIn && !isSimulating) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #2e1065 0%, #09090b 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '40px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '680px',
          width: '100%',
          background: 'rgba(18, 18, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(250, 204, 21, 0.4)',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(250,204,21,0.15)',
          boxSizing: 'border-box',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Top Decorative Line */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #ca8a04, #facc15, #9333ea)'
          }} />

          {/* Badge Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(250, 204, 21, 0.12)',
            border: '1px solid rgba(250, 204, 21, 0.3)',
            padding: '6px 16px',
            borderRadius: '20px',
            color: '#facc15',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            <span>👑</span> MultiversX Web3 Tactical Game
          </div>

          {/* Main Title */}
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #fff 0%, #facc15 50%, #ca8a04 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Hood Tycoon
          </h1>

          <p style={{
            fontSize: '0.95rem',
            color: '#d4d4d8',
            lineHeight: '1.6',
            maxWidth: '520px',
            margin: '0 auto 28px auto'
          }}>
            The tactical card game for <strong>P.F.P NFT Holders</strong>. Connect your MultiversX wallet to command your personal Boss & Crew characters in block control battles!
          </p>

          {/* Feature Showcase Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '32px',
            textAlign: 'left'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🎴</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15' }}>Real NFT Deck</div>
              <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '2px' }}>Play with characters owned in your wallet</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>🌆</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>4 City Zones</div>
              <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '2px' }}>Control Club, Vault, Street & Press</div>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '14px'
            }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '4px' }}>💥</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#c084fc' }}>3D Showdown</div>
              <div style={{ fontSize: '0.72rem', color: '#a1a1aa', marginTop: '2px' }}>Secret bribes & tactical 3D card flips</div>
            </div>
          </div>

          {/* Connect Button Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            background: 'rgba(250, 204, 21, 0.05)',
            border: '1px solid rgba(250, 204, 21, 0.2)',
            borderRadius: '16px',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fde047' }}>
              Connect your MultiversX Wallet to Enter
            </span>
            <div style={{ transform: 'scale(1.1)' }}>
              <ConnectButton />
            </div>
          </div>

          {/* Demo Mode Link */}
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
            <a
              href="/game?simulate=erd1qqqqqqqqqqqqqpgq0d23z2y49p3qj53m3u8c2c7t3n6s4"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#facc15',
                fontSize: '0.8rem',
                fontWeight: 800,
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(250, 204, 21, 0.1)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <span>🧪</span> Try Demo Mode (Simulate Deck)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged In But 0 PFP NFTs State (AAA Style)
  if (nfts.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#09090b',
        backgroundImage: 'radial-gradient(circle at 50% 20%, #0369a1 0%, #09090b 75%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        padding: '40px 20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: 'rgba(18, 18, 24, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '2px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '24px',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.9), 0 0 40px rgba(56,189,248,0.15)',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            margin: '0 auto 20px auto',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '2px solid #38bdf8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem'
          }}>
            🕵️‍♂️
          </div>

          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: '#38bdf8',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
            letterSpacing: '1px'
          }}>
            No P.F.P NFTs Found
          </h2>

          <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0 0 16px 0' }}>
            Connected Wallet: <span style={{ fontFamily: 'monospace', color: '#7dd3fc', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px' }}>{address ? `${address.slice(0, 10)}...${address.slice(-6)}` : ''}</span>
          </p>

          <p style={{ fontSize: '0.9rem', color: '#e4e4e7', lineHeight: '1.6', margin: '0 0 24px 0' }}>
            Your wallet holds 0 NFTs from collection <strong>{COLLECTION_ID}</strong>. To play Hood Tycoon, you need at least 1 PFP NFT character in your MultiversX wallet.
          </p>

          {/* Marketplace Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
            <a
              href="https://xoxno.com/collection/PFP-717e46"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #ca8a04, #facc15)',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(250, 204, 21, 0.3)'
              }}
            >
              🛒 Buy PFP on XOXNO
            </a>

            <a
              href="https://frameit.gg/collection/PFP-717e46"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #7e22ce, #a855f7)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                padding: '12px 24px',
                borderRadius: '12px',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
              }}
            >
              🖼️ Explore FrameIt
            </a>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px' }}>
            <a
              href="/game?simulate=erd1qqqqqqqqqqqqqpgq0d23z2y49p3qj53m3u8c2c7t3n6s4"
              style={{ color: '#facc15', fontSize: '0.8rem', fontWeight: 800, textDecoration: 'underline' }}
            >
              🧪 Launch Demo Deck (Try with Sample Wallet)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Active Game State (Logged in with > 0 NFTs)
  return (
    <main className="min-h-screen bg-zinc-950 py-10 px-4 text-white">
      <GameBoardUI
        gameState={gameState}
        selectedCard={selectedCard}
        onSelectCard={selectCardToPlay}
        onPlayCard={handlePlayCard}
        onResolveTurn={handleResolveTurn}
        onRestart={startNewGame}
        onToggleDifficulty={toggleDifficulty}
        onChangeActiveBoss={changeActiveBoss}
      />
    </main>
  );
}

export default function GamePage() {
  return (
    <Suspense
      fallback={
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#09090b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#facc15',
          fontWeight: 'bold'
        }}>
          Loading Hood Politics...
        </div>
      }
    >
      <GameContent />
    </Suspense>
  );
}
