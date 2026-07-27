/**
 * Native HTML5 Canvas 2D Renderer for PFP Holder Cards.
 * 100% reliable across all browsers without CORS foreignObject or font embedding issues.
 */

import { getProxiedImageUrl } from "@/utils/imageProxy";

export interface CardOptions {
    theme: "cyberpunk" | "gold" | "minimal" | "holographic";
    character: string;
    number: string;
    season: string;
    mission: string;
    customTag: string;
    imageUrl: string;
    identifier: string;
}

export async function generateHolderCardJpg(options: CardOptions): Promise<string> {
    const { theme, character, number, season, mission, customTag, imageUrl, identifier } = options;

    const W = 1080;
    const imgMarginX = 80;
    const boxW = W - imgMarginX * 2; // 920px

    // 1. Pre-calculate wrapped quote lines to determine dynamic details box height
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) {
        throw new Error("Could not get 2d context from canvas");
    }

    tempCtx.font = "italic 30px sans-serif";
    const quote = `"${mission && mission !== "N/A" ? mission : "Defying all norms in an imperfect world."}"`;
    const maxQuoteW = boxW - 72;
    const words = quote.split(" ");
    const quoteLines: string[] = [];
    let currentLine = "";

    for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + " ";
        const metrics = tempCtx.measureText(testLine);
        if (metrics.width > maxQuoteW && n > 0) {
            quoteLines.push(currentLine.trim());
            currentLine = words[n] + " ";
        } else {
            currentLine = testLine;
        }
    }
    if (currentLine.trim()) {
        quoteLines.push(currentLine.trim());
    }

    const lineHeight = 44;
    const quoteTotalHeight = quoteLines.length * lineHeight;
    const hasTag = !!(customTag && customTag.trim());

    // Calculate Box Height dynamically
    const boxPaddingTop = 32;
    const nameAndHeaderH = 50;
    const lineToQuoteGap = 36;
    const quoteToTagGap = hasTag ? 24 : 0;
    const tagHeight = hasTag ? 36 : 0;
    const boxPaddingBottom = 32;

    const boxH = boxPaddingTop + nameAndHeaderH + lineToQuoteGap + quoteTotalHeight + quoteToTagGap + tagHeight + boxPaddingBottom;

    // Dynamic Y Offsets & Canvas Height
    const imgY = 150;
    const imgH = 920; // 1:1 Square
    const boxY = imgY + imgH + 32; // 1102px
    const footerY = boxY + boxH + 42;
    const H = footerY + 54; // Dynamic Canvas Height!

    // 2. Initialize Canvas
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Could not get 2d context from canvas");
    }

    // Helper: Rounded Rectangle Path
    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + r, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y + h - r, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + r, y, r);
        ctx.closePath();
    };

    // Theme Color Palettes
    const themeColors = {
        cyberpunk: {
            bgGrad: ["#09090e", "#170d2b", "#260933"],
            border: "#ec4899",
            glow: "rgba(236, 72, 153, 0.5)",
            accent: "#f472b6",
            textPrimary: "#ffffff",
            textSecondary: "#e9d5ff",
            badgeBgGrad: ["#ec4899", "#8b5cf6"],
            badgeText: "#ffffff",
            boxBg: "rgba(15, 12, 29, 0.85)",
            boxBorder: "rgba(236, 72, 153, 0.3)",
        },
        gold: {
            bgGrad: ["#120e07", "#291f0c", "#120d04"],
            border: "#f59e0b",
            glow: "rgba(245, 158, 11, 0.45)",
            accent: "#fbbf24",
            textPrimary: "#fffbeb",
            textSecondary: "#fef3c7",
            badgeBgGrad: ["#f59e0b", "#d97706"],
            badgeText: "#000000",
            boxBg: "rgba(24, 18, 10, 0.9)",
            boxBorder: "rgba(245, 158, 11, 0.4)",
        },
        minimal: {
            bgGrad: ["#0a0a0c", "#121216", "#18181f"],
            border: "rgba(255, 255, 255, 0.4)",
            glow: "rgba(255, 255, 255, 0.15)",
            accent: "#a1a1aa",
            textPrimary: "#ffffff",
            textSecondary: "#d4d4d8",
            badgeBgGrad: ["#3f3f46", "#27272a"],
            badgeText: "#ffffff",
            boxBg: "rgba(18, 18, 22, 0.9)",
            boxBorder: "rgba(255, 255, 255, 0.15)",
        },
        holographic: {
            bgGrad: ["#0f172a", "#1e1b4b", "#311042"],
            border: "#38bdf8",
            glow: "rgba(56, 189, 248, 0.45)",
            accent: "#38bdf8",
            textPrimary: "#f0f9ff",
            textSecondary: "#e0f2fe",
            badgeBgGrad: ["#38bdf8", "#818cf8", "#c084fc"],
            badgeText: "#0f172a",
            boxBg: "rgba(15, 23, 42, 0.85)",
            boxBorder: "rgba(56, 189, 248, 0.3)",
        },
    };

    const palette = themeColors[theme];

    // 1. Draw Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, palette.bgGrad[0]);
    bgGrad.addColorStop(0.5, palette.bgGrad[1]);
    bgGrad.addColorStop(1, palette.bgGrad[2]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Outer Border & Glow
    ctx.save();
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 40;
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 8;
    roundRect(24, 24, W - 48, H - 48, 48);
    ctx.stroke();
    ctx.restore();

    // 3. Header Section
    ctx.fillStyle = palette.accent;
    ctx.font = "bold 26px sans-serif";
    ctx.fillText("PERFECT FUCKING PEOPLE", 64, 80);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "20px sans-serif";
    ctx.fillText("MultiversX Official Collection", 64, 112);

    // Badge "VERIFIED HOLDER"
    ctx.save();
    const badgeW = 240;
    const badgeH = 48;
    const badgeX = W - 64 - badgeW;
    const badgeY = 66;
    const badgeGrad = ctx.createLinearGradient(badgeX, badgeY, badgeX + badgeW, badgeY);
    badgeGrad.addColorStop(0, palette.badgeBgGrad[0]);
    badgeGrad.addColorStop(1, palette.badgeBgGrad[1]);
    ctx.fillStyle = badgeGrad;
    roundRect(badgeX, badgeY, badgeW, badgeH, 24);
    ctx.fill();

    ctx.fillStyle = palette.badgeText;
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("✓ VERIFIED HOLDER", badgeX + badgeW / 2, badgeY + 31);
    ctx.restore();

    // 4. Load & Draw NFT Image Frame (EXACT 1:1 SQUARE: 920px x 920px)
    // Image Container Background
    ctx.fillStyle = "#000000";
    roundRect(imgMarginX, imgY, boxW, imgH, 32);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Load image safely via Next.js proxy route
    if (imageUrl) {
        try {
            const proxiedSrc = getProxiedImageUrl(imageUrl);
            const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                const image = new Image();
                image.crossOrigin = "anonymous";
                image.onload = () => resolve(image);
                image.onerror = (e) => reject(e);
                image.src = proxiedSrc;
            });

            // Clip and draw image cover inside exact 1:1 square
            ctx.save();
            roundRect(imgMarginX, imgY, boxW, imgH, 32);
            ctx.clip();

            // Calculate cover aspect ratio for 1:1 square
            const imgRatio = img.width / img.height;
            let renderW = boxW;
            let renderH = imgH;
            let renderX = imgMarginX;
            let renderY = imgY;

            if (imgRatio > 1) {
                renderW = imgH * imgRatio;
                renderX = imgMarginX - (renderW - boxW) / 2;
            } else if (imgRatio < 1) {
                renderH = boxW / imgRatio;
                renderY = imgY - (renderH - imgH) / 2;
            }

            ctx.drawImage(img, renderX, renderY, renderW, renderH);
            ctx.restore();
        } catch (err) {
            console.warn("Canvas image loading error, trying fallback without crossOrigin:", err);
            try {
                const imgFallback = await new Promise<HTMLImageElement>((resolve, reject) => {
                    const image = new Image();
                    image.onload = () => resolve(image);
                    image.onerror = reject;
                    image.src = imageUrl;
                });
                ctx.save();
                roundRect(imgMarginX, imgY, boxW, imgH, 32);
                ctx.clip();
                ctx.drawImage(imgFallback, imgMarginX, imgY, boxW, imgH);
                ctx.restore();
            } catch {
                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                ctx.font = "28px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("PFP Collection Item", W / 2, imgY + imgH / 2);
            }
        }
    }

    // Number Badge Overlay inside Image Frame
    if (number) {
        ctx.save();
        const numText = `#${number}`;
        ctx.font = "bold 32px sans-serif";
        const textMetrics = ctx.measureText(numText);
        const padX = 24;
        const padY = 12;
        const numW = textMetrics.width + padX * 2;
        const numH = 48 + padY;
        const numX = imgMarginX + boxW - numW - 24;
        const numY = imgY + 24;

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
        roundRect(numX, numY, numW, numH, 20);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(numText, numX + numW / 2, numY + 36);
        ctx.restore();
    }

    // 5. Dynamic Details Section Box
    ctx.fillStyle = palette.boxBg;
    roundRect(imgMarginX, boxY, boxW, boxH, 32);
    ctx.fill();
    ctx.strokeStyle = palette.boxBorder;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Character Name
    ctx.fillStyle = palette.textPrimary;
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(character || "PFP Character", imgMarginX + 36, boxY + 68);

    // Season Tag
    ctx.fillStyle = palette.accent;
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`Season ${season || "Collectibles"}`, imgMarginX + boxW - 36, boxY + 68);

    // Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(imgMarginX + 36, boxY + 100);
    ctx.lineTo(imgMarginX + boxW - 36, boxY + 100);
    ctx.stroke();

    // Mission Quote Lines
    ctx.fillStyle = palette.textSecondary;
    ctx.font = "italic 30px sans-serif";
    ctx.textAlign = "left";

    let lineY = boxY + 144;
    for (const qLine of quoteLines) {
        ctx.fillText(qLine, imgMarginX + 36, lineY);
        lineY += lineHeight;
    }

    // Custom Tag / Handle (if provided)
    if (hasTag) {
        const tagY = lineY + 12;
        ctx.fillStyle = palette.accent;
        ctx.font = "bold 28px sans-serif";
        ctx.fillText(`🏷️ Holder: ${customTag.trim()}`, imgMarginX + 36, tagY);
    }

    // 6. Footer Section
    ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`ID: ${identifier}`, 64, footerY);

    ctx.textAlign = "right";
    ctx.fillText("@ilCriptonauta", W - 64, footerY);

    // Return JPEG Data URL
    return canvas.toDataURL("image/jpeg", 0.95);
}
