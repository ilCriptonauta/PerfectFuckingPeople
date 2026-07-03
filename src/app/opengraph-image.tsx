import { ImageResponse } from 'next/og';
import ogNfts from '../data/og_nfts.json';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Perfect Fucking People';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  // Select a random NFT from the collection
  const randomIndex = Math.floor(Math.random() * ogNfts.length);
  const nft = ogNfts[randomIndex];
  
  const charName = nft.charName;
  const season = nft.season;
  const imageUrl = nft.imageUrl;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom, #090314, #05020a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        {/* Glow Effects */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            right: '-150px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
            borderRadius: '50%',
          }}
        />

        {/* Text Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxWidth: '550px',
          }}
        >
          <div
            style={{
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '2px',
              color: '#a855f7',
              marginBottom: '10px',
            }}
          >
            MultiversX 1/1 NFT Collection
          </div>
          <div
            style={{
              fontSize: '56px',
              fontWeight: 900,
              lineHeight: '62px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ color: '#ffffff' }}>PERFECT</span>
            <span style={{ background: 'linear-gradient(to right, #ec4899, #8b5cf6)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
              FUCKING PEOPLE
            </span>
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#e2e8f0',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '10px 20px',
              borderRadius: '30px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: 'fit-content',
            }}
          >
            <span>{charName}</span>
            <span style={{ color: '#94a3b8' }}>•</span>
            <span style={{ color: '#fb923c' }}>Season {season}</span>
          </div>
        </div>

        {/* Image Container */}
        <div
          style={{
            display: 'flex',
            position: 'relative',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '2px solid rgba(124, 58, 237, 0.3)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(124, 58, 237, 0.2)',
            width: '380px',
            height: '380px',
            background: '#14141a',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={charName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
