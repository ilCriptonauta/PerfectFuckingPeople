import { useState, useEffect } from 'react';
import { useGetAccountInfo } from "@multiversx/sdk-dapp/out/react/account/useGetAccountInfo";
import { MultiversXNFT } from '@/types/nft.types';

export const COLLECTION_ID = 'PFP-717e46';

export function useWalletNFTs(simulatedAddress?: string) {
    const { address: realAddress } = useGetAccountInfo();
    const address = simulatedAddress || realAddress;
    
    const [nfts, setNfts] = useState<MultiversXNFT[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!address) {
            setNfts([]);
            return;
        }

        const fetchNFTs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch up to 100 NFTs from the collection for the address
                const response = await fetch(
                    `https://api.multiversx.com/accounts/${address}/nfts?collections=${COLLECTION_ID}&size=100`
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch NFTs');
                }
                
                const data = await response.json();
                setNfts(data || []);
            } catch (err: any) {
                console.error("Error fetching NFTs:", err);
                setError(err.message || 'Unknown error occurred');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNFTs();
    }, [address]);

    return { nfts, isLoading, error, address };
}
