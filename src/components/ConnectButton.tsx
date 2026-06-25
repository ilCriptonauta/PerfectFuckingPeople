"use client";

import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn";
import { useGetAccountInfo } from "@multiversx/sdk-dapp/out/react/account/useGetAccountInfo";
import { UnlockPanelManager } from "@multiversx/sdk-dapp/out/managers/UnlockPanelManager/UnlockPanelManager";
import { getAccountProvider } from "@multiversx/sdk-dapp/out/providers/helpers/accountProvider";
import { useRouter } from "next/navigation";

export function ConnectButton() {
    const isLoggedIn = useGetIsLoggedIn();
    const { address } = useGetAccountInfo();
    const router = useRouter();

    const handleLogin = () => {
        try {
            console.log("[ConnectButton] Opening Unlock Panel...");

            // Initialize the UnlockPanelManager with a login callback
            const unlockPanelManager = UnlockPanelManager.init({
                loginHandler: async () => {
                    console.log("[ConnectButton] Login successful!");
                    router.push('/gallery');
                }
            });

            // Open the unlock panel — this uses ComponentFactory.create()
            // which finds the registered <mvx-unlock-panel> custom element
            unlockPanelManager.openUnlockPanel();

            console.log("[ConnectButton] openUnlockPanel() called");
        } catch (err: any) {
            console.error("[ConnectButton] Failed to open unlock panel:", err);
            alert("Error opening wallet panel: " + err.message);
        }
    };

    const handleLogout = async () => {
        try {
            const provider = getAccountProvider();
            if (provider) {
                await provider.logout();
            }
        } catch (err) {
            console.error("[ConnectButton] Logout error:", err);
        }
        window.location.href = '/';
    };

    if (!isLoggedIn) {
        return (
            <button
                onClick={handleLogin}
                className="btn-primary"
                style={{ padding: '14px 32px', fontSize: '1.1rem' }}
            >
                Connect Wallet
            </button>
        );
    }

    const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
                className="glass-panel"
                style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: 'var(--accent-secondary)'
                }}
            >
                {shortAddress}
            </div>
            <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
            >
                Disconnect
            </button>
        </div>
    );
}
