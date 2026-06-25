import { MultiversXNFT } from "@/types/nft.types";
import { NFTCard } from "./NFTCard";

interface NFTGridProps {
    nfts: MultiversXNFT[];
}

export function NFTGrid({ nfts }: NFTGridProps) {
    if (!nfts || nfts.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No Perfect Fucking People found</h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                    It looks like this wallet doesn't hold any NFTs from the PFP-717e46 collection.
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
                <NFTCard key={nft.identifier} nft={nft} />
            ))}
        </div>
    );
}
