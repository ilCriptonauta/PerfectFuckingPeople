"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGetIsLoggedIn } from "@multiversx/sdk-dapp/out/react/account/useGetIsLoggedIn";
import { HeroSection } from "@/components/HeroSection";

export default function Home() {
  const isLoggedIn = useGetIsLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/gallery");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null; // Don't flash hero before redirecting
  }

  return <HeroSection />;
}
