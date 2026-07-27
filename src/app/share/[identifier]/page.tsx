import type { Metadata } from "next";
import { redirect } from "next/navigation";

interface SharePageProps {
    params: Promise<{
        identifier: string;
    }>;
    searchParams: Promise<{
        theme?: string;
        tag?: string;
    }>;
}

export async function generateMetadata({ params, searchParams }: SharePageProps): Promise<Metadata> {
    const { identifier } = await params;
    const { theme = "cyberpunk", tag = "" } = await searchParams;

    let character = "PFP Character";
    let number = identifier.split("-").pop() || "";
    let season = "Collectibles";
    let mission = "Perfect Fucking People";
    let imageUrl = "";

    if (identifier) {
        try {
            const res = await fetch(`https://api.multiversx.com/nfts/${identifier}`);
            if (res.ok) {
                const nft = await res.json();
                imageUrl = nft.media?.[0]?.thumbnailUrl || nft.url || nft.media?.[0]?.url || "";
                const match = nft.name?.match(/\d+/);
                if (match) number = match[0];

                const charAttr = nft.metadata?.attributes?.find((a: any) => a.trait_type === "Character");
                if (charAttr) character = String(charAttr.value);

                const seasonAttr = nft.metadata?.attributes?.find((a: any) => a.trait_type === "Season");
                if (seasonAttr) season = String(seasonAttr.value);

                const missionAttr = nft.metadata?.attributes?.find((a: any) => a.trait_type === "Mission");
                if (missionAttr) mission = String(missionAttr.value);
            }
        } catch (e) {
            console.error("Error generating share metadata:", e);
        }
    }

    const title = `P.F.P #${number} (${character}) | Perfect Fucking People`;
    const description = `"${mission}" - Verified Holder Card on MultiversX`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://perfect-fucking-home.vercel.app";
    const shareUrl = `${baseUrl}/share/${encodeURIComponent(identifier)}?theme=${encodeURIComponent(theme)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
    
    // Pass pre-resolved metadata in query params for instant sub-200ms Vercel OG image rendering
    const ogParams = new URLSearchParams({
        id: identifier,
        theme,
        tag,
        char: character,
        num: number,
        seas: season,
        miss: mission,
        ...(imageUrl ? { img: imageUrl } : {})
    });
    const ogImageUrl = `${baseUrl}/api/og/card?${ogParams.toString()}`;

    return {
        title,
        description,
        metadataBase: new URL(baseUrl),
        openGraph: {
            title,
            description,
            url: shareUrl,
            siteName: "Perfect Fucking People",
            type: "website",
            images: [
                {
                    url: ogImageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [ogImageUrl],
            creator: "@ilCriptonauta",
        },
    };
}

import { SharedNFTClient } from "./SharedNFTClient";
import { MultiversXNFT } from "@/types/nft.types";

export default async function SharePage({ params, searchParams }: SharePageProps) {
    const { identifier } = await params;
    const { theme = "cyberpunk", tag = "" } = await searchParams;

    let nft: MultiversXNFT | null = null;

    if (identifier) {
        try {
            const res = await fetch(`https://api.multiversx.com/nfts/${identifier}`);
            if (res.ok) {
                nft = await res.json();
            }
        } catch (e) {
            console.error("Error fetching NFT for share page:", e);
        }
    }

    if (!nft) {
        return (
            <div style={{ padding: "80px", textAlign: "center", color: "#ffffff", background: "#06060a", minHeight: "100vh" }}>
                <h2>NFT Not Found</h2>
                <p>The requested NFT could not be loaded.</p>
            </div>
        );
    }

    return <SharedNFTClient nft={nft} theme={theme} tag={tag} />;
}
