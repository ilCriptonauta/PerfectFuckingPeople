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
            return;
        }

        const controller = new AbortController();

        const fetchNFTs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(
                    `https://api.multiversx.com/accounts/${address}/nfts?collections=${COLLECTION_ID}&size=500`,
                    { signal: controller.signal }
                );
                
                if (!response.ok) {
                    throw new Error('Failed to fetch NFTs');
                }
                
                const data = await response.json();
                if (!controller.signal.aborted) {
                    setNfts(data || []);
                }
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                console.error("Error fetching NFTs:", err);
                if (!controller.signal.aborted) {
                    setError(err instanceof Error ? err.message : 'Unknown error occurred');
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        fetchNFTs();

        return () => {
            controller.abort();
        };
    }, [address]);

    return { nfts: address ? nfts : [], isLoading, error, address };
}
