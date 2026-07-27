"use client";

import Link from "next/link";
import Image from "next/image";
import { MultiversXNFT } from "@/types/nft.types";
import storiesData from "@/data/stories.json";

interface SharedNFTClientProps {
    nft: MultiversXNFT;
    theme?: string;
    tag?: string;
}

export function SharedNFTClient({ nft, theme = "cyberpunk", tag = "" }: SharedNFTClientProps) {
    const getAttribute = (traitType: string) => {
        return nft.metadata?.attributes?.find((a) => a.trait_type === traitType)?.value || "N/A";
    };

    const character = String(getAttribute("Character"));
    const mission = String(getAttribute("Mission"));
    const season = String(getAttribute("Season"));
    const background = String(getAttribute("Background"));

    const storyEntry = (storiesData as Record<string, { story: string }>)[nft.identifier];
    const storyText = storyEntry ? storyEntry.story : `A legendary piece of the Perfect Fucking People collection on MultiversX.`;

    const imageUrl = nft.media?.[0]?.url || nft.url || "";
    const numberMatch = nft.name?.match(/\d+/);
    const nftNumber = String(numberMatch ? numberMatch[0] : nft.identifier.split("-").pop() || "");

    const themeColors: Record<
        string,
        { pageBg: string; border: string; accent: string; cardBox: string; glow: string; buttonGradient: string }
    > = {
        cyberpunk: {
            pageBg: "linear-gradient(135deg, #09090e 0%, #170d2b 50%, #260933 100%)",
            border: "#ec4899",
            accent: "#f472b6",
            cardBox: "rgba(15, 12, 29, 0.85)",
            glow: "0 0 50px rgba(236, 72, 153, 0.35)",
            buttonGradient: "linear-gradient(90deg, #ec4899, #8b5cf6)",
        },
        gold: {
            pageBg: "linear-gradient(135deg, #0f0b05 0%, #261b09 50%, #140d04 100%)",
            border: "#f59e0b",
            accent: "#fbbf24",
            cardBox: "rgba(24, 18, 10, 0.85)",
            glow: "0 0 50px rgba(245, 158, 11, 0.35)",
            buttonGradient: "linear-gradient(90deg, #f59e0b, #d97706)",
        },
        minimal: {
            pageBg: "linear-gradient(135deg, #09090b 0%, #141419 50%, #1c1c24 100%)",
            border: "#a1a1aa",
            accent: "#e4e4e7",
            cardBox: "rgba(18, 18, 22, 0.85)",
            glow: "0 0 50px rgba(161, 161, 170, 0.25)",
            buttonGradient: "linear-gradient(90deg, #52525b, #27272a)",
        },
        holographic: {
            pageBg: "linear-gradient(135deg, #0b132b 0%, #1c1b4b 50%, #2e1045 100%)",
            border: "#38bdf8",
            accent: "#818cf8",
            cardBox: "rgba(15, 23, 42, 0.85)",
            glow: "0 0 50px rgba(56, 189, 248, 0.35)",
            buttonGradient: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
        },
    };

    const currentTheme = themeColors[theme] || themeColors.cyberpunk;

    return (
        <div
            style={{
                minHeight: "100vh",
                background: currentTheme.pageBg,
                color: "#ffffff",
                fontFamily: "sans-serif",
                transition: "background 0.3s ease",
            }}
        >
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
                    background: "rgba(6, 6, 10, 0.7)",
                }}
            >
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: currentTheme.buttonGradient,
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

                <Link
                    href="/"
                    style={{
                        padding: "10px 22px",
                        borderRadius: "10px",
                        background: currentTheme.buttonGradient,
                        color: "#ffffff",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: "bold",
                        boxShadow: currentTheme.glow,
                    }}
                >
                    ⚡ Connect Wallet
                </Link>
            </header>

            {/* Main Content Stage (Vertical Top-Down Layout) */}
            <main
                style={{
                    maxWidth: "680px",
                    margin: "0 auto",
                    padding: "40px 20px 80px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "36px",
                    alignItems: "center",
                }}
            >
                {/* TOP: Static Themed NFT Card (No Flip) */}
                <div
                    style={{
                        width: "100%",
                        maxWidth: "480px",
                        borderRadius: "24px",
                        background: currentTheme.cardBox,
                        border: `3px solid ${currentTheme.border}`,
                        boxShadow: currentTheme.glow,
                        padding: "16px",
                        boxSizing: "border-box",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                    }}
                >
                    {/* Image Container with Badge */}
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            paddingTop: "100%", // 1:1 Aspect Ratio
                            borderRadius: "16px",
                            overflow: "hidden",
                            background: "rgba(0, 0, 0, 0.4)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        {imageUrl && (
                            <Image
                                src={imageUrl}
                                alt={character}
                                fill
                                style={{ objectFit: "cover" }}
                                unoptimized
                            />
                        )}
                        {/* Number Badge */}
                        <div
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "rgba(0, 0, 0, 0.75)",
                                backdropFilter: "blur(6px)",
                                border: `1px solid ${currentTheme.border}`,
                                color: "#ffffff",
                                padding: "4px 10px",
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                fontWeight: "bold",
                            }}
                        >
                            #{nftNumber}
                        </div>
                    </div>

                    {/* Card Title & Collection Footer */}
                    <div
                        style={{
                            padding: "12px",
                            textAlign: "center",
                            background: "rgba(0, 0, 0, 0.3)",
                            borderRadius: "12px",
                        }}
                    >
                        <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#ffffff" }}>
                            {character}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                            P.F.P Collection
                        </div>
                    </div>
                </div>

                {/* BOTTOM: Full NFT Details Section */}
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        background: currentTheme.cardBox,
                        border: `1px solid ${currentTheme.border}66`,
                        borderRadius: "24px",
                        padding: "32px",
                        boxSizing: "border-box",
                        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
                    }}
                >
                    {/* Badge & Title */}
                    <div>
                        <div
                            style={{
                                display: "inline-block",
                                padding: "6px 14px",
                                borderRadius: "20px",
                                background: "rgba(255, 255, 255, 0.06)",
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
                        <h1 style={{ fontSize: "2.4rem", fontWeight: "900", margin: 0, lineHeight: "1.1" }}>
                            P.F.P #{nftNumber}
                        </h1>
                        {tag && (
                            <div style={{ fontSize: "1.1rem", color: currentTheme.accent, marginTop: "8px", fontWeight: "bold" }}>
                                🏷️ Holder: {tag}
                            </div>
                        )}
                    </div>

                    {/* Mission Quote */}
                    <div
                        style={{
                            background: "rgba(255, 255, 255, 0.04)",
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
                    <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <h3 style={{ fontSize: "0.9rem", color: "rgba(255, 255, 255, 0.6)", marginTop: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
                            📜 Universe Story
                        </h3>
                        <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                            {storyText}
                        </p>
                    </div>

                    {/* CTA Action Button */}
                    <Link
                        href="/"
                        style={{
                            padding: "18px",
                            borderRadius: "14px",
                            background: currentTheme.buttonGradient,
                            color: "#ffffff",
                            textDecoration: "none",
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "1.05rem",
                            boxShadow: currentTheme.glow,
                            transition: "all 0.2s ease",
                            marginTop: "8px",
                        }}
                    >
                        ⚡ Connect Wallet & Create Yours
                    </Link>
                </div>
            </main>
        </div>
    );
}
