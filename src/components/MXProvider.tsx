"use client";

import { useEffect, useState } from "react";
import { initApp } from "@multiversx/sdk-dapp/out/methods/initApp/initApp";
import { EnvironmentsEnum } from "@multiversx/sdk-dapp/out/types/enums.types";

export function MXProvider({ children }: { children: React.ReactNode }) {
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initialize = async () => {
            try {
                // Step 1: Initialize the dApp core (sets up global store, network config, etc.)
                await initApp({
                    dAppConfig: {
                        environment: EnvironmentsEnum.mainnet,
                        nativeAuth: true,
                        providers: {
                            walletConnect: {
                                walletConnectV2ProjectId: "9b1a9564f91cb659ffe21b73d5c4e2d8"
                            }
                        }
                    }
                });
                console.log("[MXProvider] initApp completed");

                // Step 2: Register MultiversX Web Components (Stencil custom elements)
                // This MUST happen before any Manager tries to use ComponentFactory.create()
                const sdkDappUi = await import("@multiversx/sdk-dapp-ui") as any;
                if (typeof sdkDappUi.defineCustomElements === "function") {
                    await sdkDappUi.defineCustomElements(window);
                    console.log("[MXProvider] defineCustomElements completed");
                } else {
                    console.warn("[MXProvider] defineCustomElements not found in sdk-dapp-ui");
                }

                // Step 3: Wait a tick for custom elements to register in the browser
                await new Promise((resolve) => setTimeout(resolve, 100));

                // Verify registration
                const unlockPanelDefined = !!window.customElements.get("mvx-unlock-panel");
                console.log("[MXProvider] mvx-unlock-panel registered:", unlockPanelDefined);

                setInitialized(true);
            } catch (err: any) {
                console.error("[MXProvider] Initialization failed:", err);
                setError(err.message || "Failed to initialize");
            }
        };
        initialize();
    }, []);

    if (error) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', background: '#0a0a0f', color: '#ef4444',
                flexDirection: 'column', gap: '1rem', padding: '2rem', textAlign: 'center'
            }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Initialization Error</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error}</div>
            </div>
        );
    }

    if (!initialized) {
        return (
            <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                height: '100vh', background: '#0a0a0f'
            }}>
                <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    border: '3px solid rgba(124, 58, 237, 0.3)',
                    borderTopColor: '#7c3aed',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <>
            {children}
        </>
    );
}
