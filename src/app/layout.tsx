import type { Metadata } from "next";
import "./globals.css";
import { MXProvider } from "@/components/MXProvider";

export const metadata: Metadata = {
  title: "Perfect Fucking Home",
  description: "Your perfect home for the PFP-717e46 NFT Collection on MultiversX",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MXProvider>
          <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </MXProvider>
      </body>
    </html>
  );
}
