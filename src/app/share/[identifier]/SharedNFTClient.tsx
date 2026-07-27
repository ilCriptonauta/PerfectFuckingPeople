"use client";

import { useState } from "react";
import Link from "next/link";
import { NFTCard } from "@/components/NFTCard";
import { MultiversXNFT } from "@/types/nft.types";
import storiesData from "@/data/stories.json";

interface SharedNFTClientProps {
    nft: MultiversXNFT;
    theme?: string;
    tag?: string;
}

export function SharedNFTClient({ nft, theme = "cyberpunk", tag = "" }: SharedNFTClientProps) {
    const [isFlipped, setIsFlipped] = useState(false);

    const getAttribute = (traitType: string) => {
        return nft.metadata?.attributes?.find((a) => a.trait_type === traitType)?.value || "N/A";
    };

    const character = getAttribute("Character");
    const mission = getAttribute("Mission");
    const season = getAttribute("Season");
    const background = getAttribute("Background");

    const storyEntry = (storiesData as Record<string, { story: string }>)[nft.identifier];
    const storyText = storyEntry ? storyEntry.story : `A legendary piece of the Perfect Fucking People collection on MultiversX.`;

    const themeColors: Record<string, { border: string; accent: string; bg: string }> = {
        cyberpunk: { border: "#ec4899", accent: "#f472b6", bg: "rgba(236, 72, 153, 0.15)" },
        gold: { border: "#f59e0b", accent: "#fbbf24", bg: "rgba(245, 158, 11, 0.15)" },
        minimal: { border: "#a1a1aa", accent: "#e4e4e7", bg: "rgba(161, 161, 170, 0.15)" },
        holographic: { border: "#38bdf8", accent: "#818cf8", bg: "rgba(56, 189, 248, 0.15)" },
    };

    const currentTheme = themeColors[theme] || themeColors.cyberpunk;

    return (
        <div style={{ minHeight: "100vh", background: "#06060a", color: "#ffffff", fontFamily: "sans-serif" }}>
            {/* Header Navbar */}
            <header
                style={{
                    padding: "20px 40px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(12px)",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    background: "rgba(6, 6, 10, 0.8)",
                }}
            >
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            color: "#ffffff",
                            fontSize: "1.1rem",
                        }}
                    >
                        P
                    </div>
                    <span style={{ fontSize: "1.2rem", fontWeight: "800", letterSpacing: "1px", color: "#ffffff" }}>
                        PERFECT FUCKING PEOPLE
                    </span>
                </Link>

                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <Link
                        href="/gallery?simulate=erd1"
                        style={{
                            padding: "10px 20px",
                            borderRadius: "10px",
                            background: "rgba(255, 255, 255, 0.08)",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            transition: "all 0.2s ease",
                        }}
                    >
                        🖼️ Explore Gallery
                    </Link>
                    <Link
                        href="/"
                        style={{
                            padding: "10px 22px",
                            borderRadius: "10px",
                            background: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                            color: "#ffffff",
                            textDecoration: "none",
                            fontSize: "0.9rem",
                            fontWeight: "bold",
                            boxShadow: "0 0 15px rgba(236, 72, 153, 0.4)",
                        }}
                    >
                        ⚡ Connect Wallet
                    </Link>
                </div>
            </header>

            {/* Main Stage */}
            <main
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "60px 20px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
                    gap: "60px",
                    alignItems: "center",
                }}
            >
                {/* 3D NFT Card Container */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
                    <div
                        style={{
                            position: "relative",
                            padding: "16px",
                            borderRadius: "24px",
                            background: currentTheme.bg,
                            border: `2px solid ${currentTheme.border}`,
                            boxShadow: `0 0 40px ${currentTheme.border}33`,
                        }}
                    >
                        <NFTCard
                            nft={nft}
                            isFlipped={isFlipped}
                            onFlip={() => setIsFlipped((prev) => !prev)}
                            isUnowned={false}
                        />
                    </div>
                    <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.85rem" }}>
                        💡 Click card to flip 3D view
                    </p>
                </div>

                {/* NFT Story & Details Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <div
                            style={{
                                display: "inline-block",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                background: currentTheme.bg,
                                color: currentTheme.accent,
                                border: `1px solid ${currentTheme.border}`,
                                fontSize: "0.8rem",
                                fontWeight: "bold",
                                textTransform: "uppercase",
                                letterSpacing: "1px",
                                marginBottom: "12px",
                            }}
                        >
                            ✓ VERIFIED MULTIVERSX HOLDER CARD
                        </div>
                        <h1 style={{ fontSize: "2.8rem", fontWeight: "900", margin: 0, lineHeight: "1.1" }}>
                            {nft.name || `${character} #${nft.identifier.split("-").pop()}`}
                        </h1>
                        {tag && (
                            <div style={{ fontSize: "1.1rem", color: currentTheme.accent, marginTop: "8px", fontWeight: "bold" }}>
                                🏷️ Shared by: {tag}
                            </div>
                        )}
                    </div>

                    {/* Mission Quote */}
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.03)",
                            borderLeft: `4px solid ${currentTheme.border}`,
                            padding: "16px 20px",
                            borderRadius: "0 16px 16px 0",
                            fontSize: "1.1rem",
                            fontStyle: "italic",
                            color: "rgba(255, 255, 255, 0.9)",
                        }}
                    >
                        "{mission !== "N/A" ? mission : "Perfect Fucking People"}"
                    </div>

                    {/* Attributes Grid */}
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "12px",
                        }}
                    >
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Character</div>
                            <div style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "4px" }}>{character}</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Season</div>
                            <div style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "4px" }}>{season}</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Background</div>
                            <div style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "4px" }}>{background}</div>
                        </div>
                        <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                            <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Collection</div>
                            <div style={{ fontSize: "1rem", fontWeight: "bold", marginTop: "4px" }}>PFP-717e46</div>
                        </div>
                    </div>

                    {/* Lore Box */}
                    <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.6)", marginTop: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                            📜 Universe Story
                        </h3>
                        <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                            {storyText}
                        </p>
                    </div>

                    {/* CTA Actions */}
                    <div style={{ display: "flex", gap: "16px", marginTop: "10px" }}>
                        <Link
                            href="/"
                            style={{
                                flex: 1,
                                padding: "16px",
                                borderRadius: "14px",
                                background: "linear-gradient(90deg, #ec4899, #7c3aed)",
                                color: "#ffffff",
                                textDecoration: "none",
                                textAlign: "center",
                                fontWeight: "bold",
                                fontSize: "1rem",
                                boxShadow: "0 4px 20px rgba(236, 72, 153, 0.4)",
                            }}
                        >
                            ⚡ Connect Wallet & Create Yours
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
