import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id") || "";
        const theme = (searchParams.get("theme") || "cyberpunk") as "cyberpunk" | "gold" | "minimal" | "holographic";
        const tag = searchParams.get("tag") || "";

        let character = searchParams.get("char") || "PFP Character";
        let number = searchParams.get("num") || id.split("-").pop() || "";
        let season = searchParams.get("seas") || "Collectibles";
        let mission = searchParams.get("miss") || "Perfect Fucking People";
        let imageUrl = searchParams.get("img") || "";

        // Only fetch from API if parameters were not pre-resolved
        if (id && !searchParams.get("char")) {
            try {
                const res = await fetch(`https://api.multiversx.com/nfts/${id}`);
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
            } catch (err) {
                console.error("Error fetching NFT data for OG image:", err);
            }
        }

        const themeStyles = {
            cyberpunk: {
                bg: "linear-gradient(135deg, #09090e, #170d2b, #260933)",
                border: "#ec4899",
                accent: "#f472b6",
                badgeBg: "linear-gradient(90deg, #ec4899, #8b5cf6)",
                boxBg: "rgba(15, 12, 29, 0.9)",
            },
            gold: {
                bg: "linear-gradient(135deg, #120e07, #291f0c, #120d04)",
                border: "#f59e0b",
                accent: "#fbbf24",
                badgeBg: "linear-gradient(90deg, #f59e0b, #d97706)",
                boxBg: "rgba(24, 18, 10, 0.9)",
            },
            minimal: {
                bg: "linear-gradient(135deg, #0a0a0c, #121216, #18181f)",
                border: "rgba(255, 255, 255, 0.4)",
                accent: "#a1a1aa",
                badgeBg: "linear-gradient(90deg, #3f3f46, #27272a)",
                boxBg: "rgba(18, 18, 22, 0.9)",
            },
            holographic: {
                bg: "linear-gradient(135deg, #0f172a, #1e1b4b, #311042)",
                border: "#38bdf8",
                accent: "#38bdf8",
                badgeBg: "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
                boxBg: "rgba(15, 23, 42, 0.9)",
            },
        };

        const currentTheme = themeStyles[theme] || themeStyles.cyberpunk;

        return new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        background: currentTheme.bg,
                        padding: "36px",
                        border: `6px solid ${currentTheme.border}`,
                        borderRadius: "36px",
                        boxSizing: "border-box",
                        fontFamily: "sans-serif",
                    }}
                >
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ fontSize: 24, fontWeight: 800, color: currentTheme.accent, letterSpacing: 2 }}>
                                PERFECT FUCKING PEOPLE
                            </div>
                            <div style={{ fontSize: 18, color: "rgba(255, 255, 255, 0.6)" }}>
                                MultiversX Official Collection
                            </div>
                        </div>
                        <div
                            style={{
                                background: currentTheme.badgeBg,
                                color: "#ffffff",
                                padding: "8px 18px",
                                borderRadius: 24,
                                fontSize: 18,
                                fontWeight: "bold",
                            }}
                        >
                            ✓ VERIFIED HOLDER
                        </div>
                    </div>

                    {/* Content Row */}
                    <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                        {/* NFT Image */}
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={character}
                                style={{
                                    width: 320,
                                    height: 320,
                                    borderRadius: 24,
                                    objectFit: "cover",
                                    border: "2px solid rgba(255, 255, 255, 0.2)",
                                }}
                            />
                        ) : null}

                        {/* Details */}
                        <div
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                background: currentTheme.boxBg,
                                borderRadius: 24,
                                padding: "28px",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
                                <div style={{ fontSize: 36, fontWeight: 800, color: "#ffffff" }}>
                                    {character} #{number}
                                </div>
                                <div style={{ fontSize: 20, color: currentTheme.accent, fontWeight: "bold" }}>
                                    Season {season}
                                </div>
                            </div>
                            <div style={{ fontSize: 22, color: "rgba(255, 255, 255, 0.85)", fontStyle: "italic", lineHeight: 1.4 }}>
                                "{mission}"
                            </div>
                            {tag ? (
                                <div style={{ fontSize: 20, color: currentTheme.accent, marginTop: 16, fontWeight: "bold" }}>
                                    🏷️ Holder: {tag}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "rgba(255, 255, 255, 0.5)" }}>
                        <div>ID: {id}</div>
                        <div>@ilCriptonauta</div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
                },
            }
        );
    } catch (e: any) {
        return new Response(`Failed to generate dynamic OG card image: ${e.message}`, { status: 500 });
    }
}
