import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        const response = await fetch(imageUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            },
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch upstream image: ${response.statusText}`, {
                status: response.status,
            });
        }

        const contentType = response.headers.get("content-type") || "image/jpeg";
        const imageBuffer = await response.arrayBuffer();

        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400, s-maxage=86400",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
            },
        });
    } catch (error: any) {
        console.error("Error in proxy-image route:", error);
        return new NextResponse("Failed to proxy image", { status: 500 });
    }
}
