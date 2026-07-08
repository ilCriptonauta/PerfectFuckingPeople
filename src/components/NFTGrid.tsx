import { MultiversXNFT } from "@/types/nft.types";
import { NFTCard } from "./NFTCard";

interface NFTGridProps {
    nfts: MultiversXNFT[];
    flippedCardId: string | null;
    onFlip: (id: string) => void;
    ownedNfts?: MultiversXNFT[];
}

export function NFTGrid({ nfts, flippedCardId, onFlip, ownedNfts }: NFTGridProps) {
    if (!nfts || nfts.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Perfect Fucking People found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    It looks like there are no NFTs matching this filter.
                </p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px',
            padding: '20px 0',
            width: '100%'
        }}>
            {nfts.map((nft) => (
                <NFTCard 
                    key={nft.identifier} 
                    nft={nft} 
                    isFlipped={flippedCardId === nft.identifier}
                    onFlip={() => onFlip(nft.identifier)}
                    isUnowned={ownedNfts !== undefined && !ownedNfts.some((o) => o.identifier === nft.identifier)}
                />
            ))}
        </div>
    );
}
