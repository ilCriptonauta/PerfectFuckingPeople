import { useState, useEffect } from "react";
import { MultiversXNFT } from "@/types/nft.types";

export interface NFTHoldingInfo {
    daysHeld: number;
    acquiredTimestamp: number;
    acquiredDateStr: string;
}

export function useNFTHoldingTimes(nfts: MultiversXNFT[], walletAddress: string | null) {
    const [holdingTimes, setHoldingTimes] = useState<Record<string, NFTHoldingInfo>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        if (!nfts || nfts.length === 0 || !walletAddress) {
            setHoldingTimes({});
            setIsLoading(false);
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const fetchHoldingTimes = async () => {
            const now = Math.floor(Date.now() / 1000);
            const results: Record<string, NFTHoldingInfo> = {};

            await Promise.all(
                nfts.map(async (nft) => {
                    let holdingTimestamp: number | null = null;

                    // 1. Query recent transactions for this NFT
                    try {
                        const txRes = await fetch(
                            `https://api.multiversx.com/nfts/${nft.identifier}/transactions?status=success&size=10`
                        );
                        if (txRes.ok) {
                            const txs = await txRes.json();
                            if (Array.isArray(txs) && txs.length > 0) {
                                const lastRx = txs.find(
                                    (t: any) =>
                                        t.receiver === walletAddress ||
                                        t.action?.arguments?.receiver === walletAddress
                                );
                                if (lastRx && lastRx.timestamp) {
                                    holdingTimestamp = lastRx.timestamp;
                                } else if (txs[0] && txs[0].timestamp) {
                                    holdingTimestamp = txs[0].timestamp;
                                }
                            }
                        }
                    } catch (e) {
                        // ignore API fetch error
                    }

                    // 2. Fallback: Query single NFT endpoint for creation timestamp
                    if (!holdingTimestamp) {
                        try {
                            const singleRes = await fetch(
                                `https://api.multiversx.com/nfts/${nft.identifier}`
                            );
                            if (singleRes.ok) {
                                const singleData = await singleRes.json();
                                if (singleData && singleData.timestamp) {
                                    holdingTimestamp = singleData.timestamp;
                                }
                            }
                        } catch (e) {
                            // ignore API fetch error
                        }
                    }

                    // Final fallback: use current timestamp if unavailable
                    const finalTs = holdingTimestamp || now;
                    const days = Math.max(1, Math.floor((now - finalTs) / 86400));
                    const dateObj = new Date(finalTs * 1000);
                    const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                    });

                    results[nft.identifier] = {
                        daysHeld: days,
                        acquiredTimestamp: finalTs,
                        acquiredDateStr: formattedDate
                    };
                })
            );

            if (isMounted) {
                setHoldingTimes(results);
                setIsLoading(false);
            }
        };

        fetchHoldingTimes();

        return () => {
            isMounted = false;
        };
    }, [nfts, walletAddress]);

    return { holdingTimes, isLoading };
}
