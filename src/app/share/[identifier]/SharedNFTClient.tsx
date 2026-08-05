"use client";

import { useState } from "react";
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
    const [isFlipped, setIsFlipped] = useState(false);

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
            cardBox: "rgba(15, 12, 29, 0.95)",
            glow: "0 0 50px rgba(236, 72, 153, 0.35)",
            buttonGradient: "linear-gradient(90deg, #ec4899, #8b5cf6)",
        },
        gold: {
            pageBg: "linear-gradient(135deg, #0f0b05 0%, #261b09 50%, #140d04 100%)",
            border: "#f59e0b",
            accent: "#fbbf24",
            cardBox: "rgba(24, 18, 10, 0.95)",
            glow: "0 0 50px rgba(245, 158, 11, 0.35)",
            buttonGradient: "linear-gradient(90deg, #f59e0b, #d97706)",
        },
        minimal: {
            pageBg: "linear-gradient(135deg, #09090b 0%, #141419 50%, #1c1c24 100%)",
            border: "#a1a1aa",
            accent: "#e4e4e7",
            cardBox: "rgba(18, 18, 22, 0.95)",
            glow: "0 0 50px rgba(161, 161, 170, 0.25)",
            buttonGradient: "linear-gradient(90deg, #52525b, #27272a)",
        },
        holographic: {
            pageBg: "linear-gradient(135deg, #0b132b 0%, #1c1b4b 50%, #2e1045 100%)",
            border: "#38bdf8",
            accent: "#818cf8",
            cardBox: "rgba(15, 23, 42, 0.95)",
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

            {/* Main Stage: 3D Flip Holder Card Stage */}
            <main
                style={{
                    maxWidth: "600px",
                    margin: "0 auto",
                    padding: "40px 20px 80px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "28px",
                }}
            >
                {/* 3D Perspective Container */}
                <div
                    style={{
                        perspective: "1200px",
                        width: "100%",
                        maxWidth: "500px",
                        cursor: "pointer",
                    }}
                    onClick={() => setIsFlipped((prev) => !prev)}
                >
                    {/* Inner Card Flipper */}
                    <div
                        style={{
                            position: "relative",
                            width: "100%",
                            minHeight: "680px",
                            transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                            transformStyle: "preserve-3d",
                            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        }}
                    >
                        {/* FRONT FACE: Exact Holder Card Layout (Allegato 2) */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                background: currentTheme.cardBox,
                                border: `3px solid ${currentTheme.border}`,
                                borderRadius: "28px",
                                boxShadow: currentTheme.glow,
                                padding: "24px",
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "16px",
                            }}
                        >
                            {/* Card Header inside Frame */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                <div>
                                    <div style={{ fontSize: "1.15rem", fontWeight: "900", color: currentTheme.accent, letterSpacing: "0.5px" }}>
                                        PERFECT FUCKING PEOPLE
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.6)", marginTop: "2px" }}>
                                        MultiversX Official Collection
                                    </div>
                                </div>
                                <div
                                    style={{
                                        background: currentTheme.buttonGradient,
                                        color: "#ffffff",
                                        padding: "6px 14px",
                                        borderRadius: "20px",
                                        fontSize: "0.75rem",
                                        fontWeight: "bold",
                                        letterSpacing: "0.5px",
                                    }}
                                >
                                    ✓ VERIFIED HOLDER
                                </div>
                            </div>

                            {/* Square NFT Image Box */}
                            <div
                                style={{
                                    position: "relative",
                                    width: "100%",
                                    paddingTop: "100%",
                                    borderRadius: "20px",
                                    overflow: "hidden",
                                    background: "rgba(0, 0, 0, 0.5)",
                                    border: "1px solid rgba(255, 255, 255, 0.15)",
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
                                {/* Badge Number */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "14px",
                                        right: "14px",
                                        background: "rgba(0, 0, 0, 0.8)",
                                        backdropFilter: "blur(6px)",
                                        border: `1px solid ${currentTheme.border}`,
                                        color: "#ffffff",
                                        padding: "4px 12px",
                                        borderRadius: "12px",
                                        fontSize: "0.9rem",
                                        fontWeight: "800",
                                    }}
                                >
                                    #{nftNumber}
                                </div>
                            </div>

                            {/* Details Box inside Frame */}
                            <div
                                style={{
                                    background: "rgba(0, 0, 0, 0.5)",
                                    border: "1px solid rgba(255, 255, 255, 0.12)",
                                    borderRadius: "18px",
                                    padding: "16px 20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ fontSize: "1.4rem", fontWeight: "800", color: "#ffffff" }}>
                                        {character}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: currentTheme.accent, fontWeight: "bold" }}>
                                        Season {season}
                                    </div>
                                </div>

                                <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.1)", margin: "2px 0" }} />

                                <div style={{ fontSize: "1rem", fontStyle: "italic", color: "rgba(255, 255, 255, 0.85)", lineHeight: "1.4" }}>
                                    &quot;{mission !== "N/A" ? mission : "Perfect Fucking People"}&quot;
                                </div>
                            </div>

                            {/* Card Footer Watermark */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "rgba(255, 255, 255, 0.45)" }}>
                                <div>ID: {nft.identifier}</div>
                                <div>{tag.trim() ? tag : "@ilCriptonauta"}</div>
                            </div>
                        </div>

                        {/* BACK FACE: Detailed Info & Story Lore */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                backfaceVisibility: "hidden",
                                WebkitBackfaceVisibility: "hidden",
                                transform: "rotateY(180deg)",
                                background: currentTheme.cardBox,
                                border: `3px solid ${currentTheme.border}`,
                                borderRadius: "28px",
                                boxShadow: currentTheme.glow,
                                padding: "28px",
                                boxSizing: "border-box",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between",
                                gap: "16px",
                            }}
                        >
                            <div>
                                <div
                                    style={{
                                        display: "inline-block",
                                        padding: "4px 12px",
                                        borderRadius: "16px",
                                        background: "rgba(255, 255, 255, 0.08)",
                                        color: currentTheme.accent,
                                        border: `1px solid ${currentTheme.border}`,
                                        fontSize: "0.75rem",
                                        fontWeight: "bold",
                                        textTransform: "uppercase",
                                        letterSpacing: "1px",
                                        marginBottom: "8px",
                                    }}
                                >
                                    ✓ CHARACTER DETAILS
                                </div>
                                <h2 style={{ fontSize: "1.8rem", fontWeight: "900", margin: "4px 0 12px 0" }}>
                                    P.F.P #{nftNumber} - {character}
                                </h2>

                                {/* Mission */}
                                <div
                                    style={{
                                        background: "rgba(255, 255, 255, 0.04)",
                                        borderLeft: `4px solid ${currentTheme.border}`,
                                        padding: "12px 16px",
                                        borderRadius: "0 12px 12px 0",
                                        fontSize: "0.95rem",
                                        fontStyle: "italic",
                                        color: "rgba(255, 255, 255, 0.9)",
                                        marginBottom: "16px",
                                    }}
                                >
                                    &quot;{mission !== "N/A" ? mission : "Perfect Fucking People"}&quot;
                                </div>

                                {/* Attributes */}
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px", marginBottom: "16px" }}>
                                    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "10px" }}>
                                        <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Character</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{character}</div>
                                    </div>
                                    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "10px" }}>
                                        <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Season</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{season}</div>
                                    </div>
                                    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "10px" }}>
                                        <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Background</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>{background}</div>
                                    </div>
                                    <div style={{ background: "rgba(255, 255, 255, 0.05)", padding: "10px", borderRadius: "10px" }}>
                                        <div style={{ fontSize: "0.7rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase" }}>Collection</div>
                                        <div style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "2px" }}>PFP-717e46</div>
                                    </div>
                                </div>

                                {/* Lore Paragraph */}
                                <div style={{ background: "rgba(255, 255, 255, 0.04)", padding: "14px", borderRadius: "12px" }}>
                                    <div style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "6px" }}>
                                        📜 Universe Story
                                    </div>
                                    <p style={{ fontSize: "0.85rem", lineHeight: "1.5", color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>
                                        {storyText}
                                    </p>
                                </div>
                            </div>

                            {/* Back Footer */}
                            <div style={{ textAlign: "center", fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.5)" }}>
                                💡 Click to flip back
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtitle Hint */}
                <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: "0.9rem", margin: 0 }}>
                    💡 Click card to flip 3D view
                </p>

                {/* CTA Action Button below stage */}
                <Link
                    href="/"
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        padding: "18px",
                        borderRadius: "14px",
                        background: currentTheme.buttonGradient,
                        color: "#ffffff",
                        textDecoration: "none",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                        boxShadow: currentTheme.glow,
                        transition: "all 0.2s ease",
                    }}
                >
                    ⚡ Connect Wallet & Create Yours
                </Link>
            </main>
        </div>
    );
}
