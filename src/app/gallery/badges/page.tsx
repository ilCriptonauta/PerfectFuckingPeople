"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BadgesRedirectContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const paramsStr = searchParams.toString();
        const dest = paramsStr ? `/gallery/profile?${paramsStr}` : "/gallery/profile";
        router.replace(dest);
    }, [router, searchParams]);

    return (
        <div className="badges-container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h2 className="text-gradient">Redirecting to My Fucking Profile...</h2>
        </div>
    );
}

export default function BadgesPage() {
    return (
        <Suspense fallback={
            <div className="badges-container" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h2>Loading Profile...</h2>
            </div>
        }>
            <BadgesRedirectContent />
        </Suspense>
    );
}
