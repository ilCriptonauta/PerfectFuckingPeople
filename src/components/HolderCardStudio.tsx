"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MultiversXNFT } from "@/types/nft.types";
import { fetchImageAsDataUri, getProxiedImageUrl } from "@/utils/imageProxy";
import { generateHolderCardJpg } from "@/utils/cardCanvasGenerator";

interface HolderCardStudioProps {
    nft: MultiversXNFT;
    isOpen: boolean;
    onClose: () => void;
}

export type CardTheme = "cyberpunk" | "gold" | "minimal" | "holographic";

export function HolderCardStudio({ nft, isOpen, onClose }: HolderCardStudioProps) {
    const [theme, setTheme] = useState<CardTheme>("cyberpunk");
    const [customTag, setCustomTag] = useState<string>("");
    const [dataUriImage, setDataUriImage] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

    const cardRef = useRef<HTMLDivElement>(null);

    // Extract attributes
    const getAttribute = (traitType: string): string => {
        const val = nft.metadata?.attributes?.find(a => a.trait_type === traitType)?.value;
        return val !== undefined && val !== null ? String(val) : "N/A";
    };

    const character = getAttribute("Character");
    const mission = getAttribute("Mission");
    const season = getAttribute("Season");

    const match = nft.name.match(/\d+/);
    const number = match ? match[0] : "";

    const rawImageUrl = nft.url || nft.media?.[0]?.url || nft.media?.[0]?.thumbnailUrl;

    // Convert image to Data URI on load for CORS-safe export
    useEffect(() => {
        if (rawImageUrl && isOpen) {
            fetchImageAsDataUri(rawImageUrl).then(uri => {
                setDataUriImage(uri);
            });
        }
    }, [rawImageUrl, isOpen]);

    if (!isOpen || typeof document === "undefined") return null;

    // Theme Styles Configuration
    const themeStyles: Record<CardTheme, {
        containerBg: string;
        border: string;
        glow: string;
        textPrimary: string;
        textAccent: string;
        cardInnerBg: string;
        badgeBg: string;
        badgeText: string;
    }> = {
        cyberpunk: {
            containerBg: "linear-gradient(135deg, #09090e 0%, #170d2b 50%, #260933 100%)",
            border: "2px solid rgba(236, 72, 153, 0.6)",
            glow: "0 0 40px rgba(236, 72, 153, 0.4), 0 0 80px rgba(124, 58, 237, 0.2)",
            textPrimary: "#ffffff",
            textAccent: "#f472b6",
            cardInnerBg: "rgba(15, 12, 29, 0.75)",
            badgeBg: "linear-gradient(90deg, #ec4899, #8b5cf6)",
            badgeText: "#ffffff",
        },
        gold: {
            containerBg: "linear-gradient(135deg, #120e07 0%, #291f0c 50%, #120d04 100%)",
            border: "2px solid rgba(245, 158, 11, 0.7)",
            glow: "0 0 40px rgba(245, 158, 11, 0.35), 0 0 80px rgba(217, 119, 6, 0.2)",
            textPrimary: "#fffbeb",
            textAccent: "#fbbf24",
            cardInnerBg: "rgba(24, 18, 10, 0.8)",
            badgeBg: "linear-gradient(90deg, #f59e0b, #d97706)",
            badgeText: "#000000",
        },
        minimal: {
            containerBg: "linear-gradient(135deg, #0a0a0c 0%, #121216 50%, #18181f 100%)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            glow: "0 0 30px rgba(255, 255, 255, 0.1)",
            textPrimary: "#ffffff",
            textAccent: "#a1a1aa",
            cardInnerBg: "rgba(18, 18, 22, 0.85)",
            badgeBg: "linear-gradient(90deg, #3f3f46, #27272a)",
            badgeText: "#ffffff",
        },
        holographic: {
            containerBg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)",
            border: "2px solid rgba(56, 189, 248, 0.7)",
            glow: "0 0 40px rgba(56, 189, 248, 0.35), 0 0 80px rgba(236, 72, 153, 0.25)",
            textPrimary: "#f0f9ff",
            textAccent: "#38bdf8",
            cardInnerBg: "rgba(15, 23, 42, 0.8)",
            badgeBg: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
            badgeText: "#0f172a",
        },
    };

    const currentStyle = themeStyles[theme];

    // Download JPG handler
    const handleDownloadJpg = async () => {
        setIsGenerating(true);
        try {
            const dataUrl = await generateHolderCardJpg({
                theme,
                character,
                number,
                season: String(season),
                mission,
                customTag,
                imageUrl: dataUriImage || rawImageUrl,
                identifier: nft.identifier,
            });

            const link = document.createElement("a");
            link.download = `PFP-HolderCard-#${number || "NFT"}.jpg`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error("Error generating JPG:", err);
            alert("Could not download image. Please try again in a few seconds.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Share on X (Twitter) handler
    const handleShareX = async () => {
        setIsGenerating(true);

        try {
            const dataUrl = await generateHolderCardJpg({
                theme,
                character,
                number,
                season: String(season),
                mission,
                customTag,
                imageUrl: dataUriImage || rawImageUrl,
                identifier: nft.identifier,
            });

            const blobRes = await fetch(dataUrl);
            const blob = await blobRes.blob();

            if (navigator.clipboard && window.ClipboardItem) {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ "image/png": blob })
                    ]);
                    setCopiedStatus(true);
                    setTimeout(() => setCopiedStatus(false), 5000);
                } catch (clipErr) {
                    console.warn("Clipboard copy failed:", clipErr);
                }
            }
        } catch (e) {
            console.warn("Could not copy image blob to clipboard:", e);
        } finally {
            setIsGenerating(false);
        }

        // Compose Option A Share Link (Dynamic Twitter OG Card Preview + Direct NFT Landing)
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://pfp-nft.com";
        const shareUrl = `${baseUrl}/share/${encodeURIComponent(nft.identifier)}?theme=${encodeURIComponent(theme)}${customTag.trim() ? `&tag=${encodeURIComponent(customTag.trim())}` : ''}`;

        // Compose X Tweet text
        const tweetText = `Proud Holder of P.F.P #${number} (${character})! 🚀\n\n` +
            `Mission: "${mission !== "N/A" ? mission : "Perfect Fucking People"}"\n\n` +
            (customTag.trim() ? `Holder: ${customTag.trim()}\n\n` : "") +
            `Check out my custom PFP Holder Card! @ilCriptonauta #MultiversX #PFPCollection #EGLD`;

        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
    };

    return createPortal(
        <div 
            className="modal-overlay"
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                overflowY: 'auto'
            }}
        >
            <div 
                className="glass-panel"
                onClick={(e) => e.stopPropagation()}
                style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '1000px',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(15, 15, 25, 0.95)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: 'none',
                        color: '#ffffff',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        fontSize: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}
                >
                    ✕
                </button>

                <h2 className="text-gradient" style={{ fontSize: '1.6rem', marginBottom: '8px', textAlign: 'left' }}>
                    🎨 PFP Holder Card Studio
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px', textAlign: 'left' }}>
                    Customize your Holder Card, download it in high resolution (.JPG), and share it on X!
                </p>

                {/* Main Studio Area */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px', alignItems: 'start' }}>
                    
                    {/* Controls Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
                        
                        {/* Theme Picker */}
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
                                Select Graphic Theme
                            </label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {(["cyberpunk", "gold", "minimal", "holographic"] as CardTheme[]).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        style={{
                                            padding: '10px 14px',
                                            borderRadius: '12px',
                                            border: theme === t ? '2px solid var(--accent-secondary)' : '1px solid rgba(255, 255, 255, 0.1)',
                                            background: theme === t ? 'rgba(124, 58, 237, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                                            color: theme === t ? '#ffffff' : 'var(--text-secondary)',
                                            fontSize: '0.85rem',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            textTransform: 'capitalize',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        {t === "cyberpunk" && "🔮 Cyberpunk"}
                                        {t === "gold" && "👑 Galactic Gold"}
                                        {t === "minimal" && "🕶️ Minimal Dark"}
                                        {t === "holographic" && "✨ Holographic"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Handle / Tag */}
                        <div>
                            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>
                                X Handle or Holder Signature (optional)
                            </label>
                            <input 
                                type="text"
                                value={customTag}
                                onChange={(e) => setCustomTag(e.target.value)}
                                placeholder="e.g. @Criptonauta_X or Proud Holder"
                                maxLength={30}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    background: 'rgba(0, 0, 0, 0.4)',
                                    color: '#ffffff',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Notification Status */}
                        {copiedStatus && (
                            <div style={{
                                padding: '10px 14px',
                                borderRadius: '10px',
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.5)',
                                color: '#4ade80',
                                fontSize: '0.85rem',
                                fontWeight: 'bold'
                            }}>
                                📋 Card copied to clipboard! Press &quot;Paste&quot; (Ctrl+V) on X to attach it.
                            </div>
                        )}

                        {/* Quick Instructions */}
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            lineHeight: '1.5'
                        }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '6px', fontSize: '0.82rem' }}>
                                How it works:
                            </div>
                            <ol style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <li>Choose a theme for your card</li>
                                <li>Download the image</li>
                                <li>Share on X attaching the image</li>
                            </ol>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                            <button
                                onClick={handleDownloadJpg}
                                disabled={isGenerating}
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(90deg, #ec4899, #7c3aed)',
                                    color: '#ffffff',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: isGenerating ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                                }}
                            >
                                {isGenerating ? "⚡ Generating..." : "📥 Download Card .JPG"}
                            </button>

                            <button
                                onClick={handleShareX}
                                disabled={isGenerating}
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    background: '#000000',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    cursor: isGenerating ? 'wait' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px'
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                Share on X (Twitter)
                            </button>
                        </div>

                    </div>

                    {/* Preview Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Card Preview
                        </span>

                        {/* Exportable Element (Fixed Aspect Ratio 1:1) */}
                        <div
                            ref={cardRef}
                            style={{
                                width: '380px',
                                minHeight: '580px',
                                borderRadius: '24px',
                                background: currentStyle.containerBg,
                                border: currentStyle.border,
                                boxShadow: currentStyle.glow,
                                padding: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                justifyContent: 'space-between',
                                position: 'relative',
                                overflow: 'hidden',
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                                <div>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px', color: currentStyle.textAccent, textTransform: 'uppercase' }}>
                                        PERFECT FUCKING PEOPLE
                                    </div>
                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>
                                        MultiversX Official Collection
                                    </div>
                                </div>
                                <div style={{
                                    background: currentStyle.badgeBg,
                                    color: currentStyle.badgeText,
                                    padding: '4px 10px',
                                    borderRadius: '20px',
                                    fontSize: '0.65rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '0.5px'
                                }}>
                                    ✓ VERIFIED HOLDER
                                </div>
                            </div>

                            {/* Center NFT Image Frame (EXACT 1:1 SQUARE) */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '1 / 1',
                                borderRadius: '16px',
                                overflow: 'hidden',
                                position: 'relative',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                background: '#000000',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {(dataUriImage || rawImageUrl) ? (
                                    <img 
                                        src={dataUriImage || getProxiedImageUrl(rawImageUrl) || rawImageUrl} 
                                        alt={nft.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Loading Image...</span>
                                )}
                                <div style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(0,0,0,0.7)',
                                    backdropFilter: 'blur(6px)',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: '#ffffff',
                                    border: '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    #{number}
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div style={{
                                background: currentStyle.cardInnerBg,
                                borderRadius: '16px',
                                padding: '14px',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                textAlign: 'left'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                    <h3 style={{ fontSize: '1.2rem', color: currentStyle.textPrimary, margin: 0, fontWeight: 800 }}>
                                        {character}
                                    </h3>
                                    <span style={{ fontSize: '0.7rem', color: currentStyle.textAccent, fontWeight: 'bold' }}>
                                        Season {season}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic', lineHeight: 1.3 }}>
                                    &quot;{mission !== "N/A" ? mission : "Defying all norms in an imperfect world."}&quot;
                                </div>

                                {customTag.trim() && (
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        color: currentStyle.textAccent, 
                                        fontWeight: 'bold',
                                        marginTop: '4px',
                                        borderTop: '1px dashed rgba(255,255,255,0.1)',
                                        paddingTop: '6px'
                                    }}>
                                        🏷️ Holder: {customTag.trim()}
                                    </div>
                                )}
                            </div>

                            {/* Footer Watermark */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <span>ID: {nft.identifier}</span>
                                <span>@ilCriptonauta</span>
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>,
        document.body
    );
}
