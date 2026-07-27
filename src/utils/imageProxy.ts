/**
 * Utility functions for loading cross-origin images via internal proxy
 * for CORS-safe HTML5 Canvas rendering.
 */

export function getProxiedImageUrl(url: string): string {
    if (!url) return "";
    // If it's already a data URI or local path, return as is
    if (url.startsWith("data:") || url.startsWith("/")) {
        return url;
    }
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
}

export async function fetchImageAsDataUri(url: string): Promise<string> {
    if (!url) return "";
    if (url.startsWith("data:")) return url;

    try {
        const proxiedUrl = getProxiedImageUrl(url);
        const response = await fetch(proxiedUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch proxied image: ${response.statusText}`);
        }
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert blob to data URI"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("Could not convert image to Data URI via proxy, fallback:", error);
        return url;
    }
}
