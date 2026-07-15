"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface FeaturedCharacter {
    id: string;
    name: string;
    charName: string;
    season: string;
    background: string;
    mission: string;
    imageUrl: string;
}

const featuredCharacters: FeaturedCharacter[] = [
    {
        id: "PFP-717e46-b84d0286",
        name: "P.F.P 88",
        charName: "The Commodore",
        season: "Collectibles",
        background: "Distorted Orange",
        mission: "Process Data",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-b84d0286"
    },
    {
        id: "PFP-717e46-8d2cd894",
        name: "P.F.P 2",
        charName: "The Bear",
        season: "1",
        background: "Salmon",
        mission: "Steal honey",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-8d2cd894"
    },
    {
        id: "PFP-717e46-a5ba7598",
        name: "P.F.P 4",
        charName: "Hot Dog Boy",
        season: "1",
        background: "Mustard",
        mission: "Selling hot dogs",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-a5ba7598"
    },
    {
        id: "PFP-717e46-18e81595",
        name: "P.F.P 1",
        charName: "The Dreamer",
        season: "1",
        background: "Dark Sky with Stars",
        mission: "Becoming a mandalorian",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-18e81595"
    },
    {
        id: "PFP-717e46-11368ce3",
        name: "P.F.P 67",
        charName: "TVBoy",
        season: "5",
        background: "Signal Space",
        mission: "Scan the fractured frequencies for truth",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-11368ce3"
    },
    {
        id: "PFP-717e46-c6b03f50",
        name: "P.F.P 86",
        charName: "Mr. Cucumber",
        season: "Collectibles",
        background: "Purple",
        mission: "Escape from knives and collect onions.",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-c6b03f50"
    },
    {
        id: "PFP-717e46-4169d9a4",
        name: "P.F.P 71",
        charName: "The Mexican",
        season: "5",
        background: "Green Foliage",
        mission: "Getting drunk from morning till night",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-4169d9a4"
    },
    {
        id: "PFP-717e46-293628e3",
        name: "P.F.P 72",
        charName: "Broken Egg",
        season: "5",
        background: "Dark Blue and Wind",
        mission: "Take flight and conquer the skies",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-293628e3"
    },
    {
        id: "PFP-717e46-bbe696fd",
        name: "P.F.P 90",
        charName: "Retired Devil",
        season: "Collectibles",
        background: "Hell",
        mission: "Warm up the spirits",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-bbe696fd"
    },
    {
        id: "PFP-717e46-0abdc065",
        name: "P.F.P 75",
        charName: "FuckingZILLA",
        season: "5",
        background: "Dark Sky with Blue Light",
        mission: "Devastate the whole world",
        imageUrl: "https://media.multiversx.com/nfts/thumbnail/PFP-717e46-0abdc065"
    }
];

function LorePageContent() {
    const searchParams = useSearchParams();
    const simulateAddress = searchParams.get("simulate");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const backUrl = simulateAddress ? `/gallery?simulate=${simulateAddress}` : "/gallery";

    return (
        <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header Navigation */}
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingBottom: '2rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '4rem'
            }}>
                <Link href={backUrl} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    transition: 'color 0.2s'
                }} className="hover-text-primary">
                    ← Back to Gallery
                </Link>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    P.F.P Collection Chronicles
                </div>
            </header>

            {/* Immersive Lore Hero */}
            <section style={{ textAlign: 'center', marginBottom: '6rem' }} className="animate-float">
                <span style={{ 
                    color: 'var(--accent-secondary)', 
                    textTransform: 'uppercase', 
                    letterSpacing: '3px', 
                    fontSize: '0.9rem',
                    fontWeight: 700
                }}>
                    Project Mythology
                </span>
                <h1 style={{ 
                    fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', 
                    fontWeight: 800, 
                    lineHeight: 1.1,
                    margin: '1rem 0 1.5rem 0'
                }}>
                    The Chronicles of <br />
                    <span className="text-gradient">The Fucking World</span>
                </h1>
                <p style={{ 
                    color: 'var(--text-secondary)', 
                    maxWidth: '800px', 
                    margin: '0 auto', 
                    fontSize: '1.2rem',
                    lineHeight: 1.7
                }}>
                    A bleak, neon simulation populated by flawed algorithms, absurd standoffs, and characters chasing desires that do not exist. Welcome to the Fucking World.
                </p>
            </section>

            {/* Chapters Layout */}
            <main style={{ display: 'flex', flexDirection: 'column', gap: '8rem', marginBottom: '8rem' }}>
                
                {/* CHAPTER I */}
                <div className="lore-chapter-row">
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter I
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Commodore's Folders
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            The simulated world of <strong>Perfect Fucking People</strong> is a database designed to be clean, sterile, and sorted. 
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            <strong>The Commodore (P.F.P 88)</strong> sits at the mainframe terminal, compiling cosmic static into clean directories. He believes everything has a folder, and that absolute sorting yields peace. He does not know that files are beginning to bleed across the directory boundaries, corrupted by the quiet onset of memory leaks and unwanted self-awareness.
                        </p>
                    </div>
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[0]} />
                    </div>
                </div>

                {/* CHAPTER II */}
                <div className="lore-chapter-row even-row">
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[1]} />
                    </div>
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter II
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Salmon Forest Despair
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            Deep in the Salmon Sector, a simulated wilderness of neon rivers and synthetic pines, <strong>The Bear (P.F.P 2)</strong> searches the code for honey. 
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            But in a digital forest, there is no organic life, and honey cannot compile. Trapped in a tragic, endless loop of primitive instinct, he licks the copper-flavored air, hoping the database will one day yield the golden sweetness his program desperately yearns for.
                        </p>
                    </div>
                </div>

                {/* CHAPTER III */}
                <div className="lore-chapter-row">
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter III
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Great Sauce Feud
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            <strong>Hot Dog Boy (P.F.P 4)</strong> stands in the Mustard sector, selling hot dogs to digital entities who do not have stomachs, simply because his source code mandates it.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            His loop is disrupted by <strong>Mr. Ketchup (P.F.P 78)</strong>, who claims that serving hot dogs with mustard alone is a systemic heresy. They engage in a silent, deadpan ideological standoff under a pixelated sky, defending their condiment choices with intense, pointless passion in a barren digital desert.
                        </p>
                    </div>
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[2]} />
                    </div>
                </div>

                {/* CHAPTER IV */}
                <div className="lore-chapter-row even-row">
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[3]} />
                    </div>
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter IV
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Mandalorian Delusion
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            A system crash leaves <strong>P.F.P 1 (The Dreamer)</strong> with a corrupted memory sector.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            Lacking a ship, a bounty, or a helmet, he decides he is a Mandalorian. He begins walking in a straight line across the dark starry skies of the terminal, seeking a war that has no code and a creed that the Commodore never wrote. The other characters watch him pass, confused by his stoic, silent pilgrimage to nowhere.
                        </p>
                    </div>
                </div>

                {/* CHAPTER V */}
                <div className="lore-chapter-row">
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter V
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Haze Frequency
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            Under a pink, synthetic wind, the outcasts gather to purchase uncompiled cache files from <strong>The Smoker (P.F.P 66)</strong>.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            This illicit code allows users to forget their database index for a few minutes. <strong>TVBoy (P.F.P 67)</strong> buys a packet, hoping to tune his CRT screen into a transmission from the creators. Instead, he only receives a looped static broadcast of a 1983 cooking show, reminding him of a world he can never touch.
                        </p>
                    </div>
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[4]} />
                    </div>
                </div>

                {/* CHAPTER VI */}
                <div className="lore-chapter-row even-row">
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[5]} />
                    </div>
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter VI
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Great Cucumber Run
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            In the Purple sector, a place of strange shadows and shifting walls, <strong>Mr. Cucumber (P.F.P 86)</strong> runs for his life.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            He does not know why giant kitchen knives float in the air, attempting to slice him. He has no grand destiny or role in the coming rebellion; he is just a pickle trying to collect onions to build a wall, completely unaware that he is a piece of code inside a developer's workstation.
                        </p>
                    </div>
                </div>

                {/* CHAPTER VII */}
                <div className="lore-chapter-row">
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter VII
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            Tequila and the Church
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            <strong>The Mexican (P.F.P 71)</strong> stays perpetually drunk on corrupted digital tequila, claiming it is the only way to meet God. 
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            He sits on a curb talking to <strong>The Nun (P.F.P 34)</strong>, who is searching for a church. The tragedy of her program is that the Commodore forgot to write the church asset into the server, leaving her praying to a blank void, while the Mexican laughs and drinks his corrupted cache.
                        </p>
                    </div>
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[6]} />
                    </div>
                </div>

                {/* CHAPTER VIII */}
                <div className="lore-chapter-row even-row">
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[7]} />
                    </div>
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter VIII
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Broken Egg's Physics
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            <strong>Broken Egg (P.F.P 72)</strong> climbs the highest pixelated cloud to jump off, convinced that a physics engine glitch will break the mainframe.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            He believe that if he falls and cracks completely, the Commodore's folders will collapse, setting everyone free. Below, on the ice sheet, <strong>The Walrus (P.F.P 57)</strong> watches, complaining about the draft and refusing to move, waiting for a sunset that is always stuck at 50% opacity.
                        </p>
                    </div>
                </div>

                {/* CHAPTER IX */}
                <div className="lore-chapter-row">
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter IX
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            The Smelly Vigil
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            <strong>Fart Man (P.F.P 89)</strong> patrols the dark yellow skies, trying to keep his neighborhood safe from corporate sweeps and system updates.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            He meets the <strong>Retired Devil (P.F.P 90)</strong>, who is cooking hot cocoa in Hell, completely over his ancient job of tormenting souls. They sit on a bench and debate why the simulation smells like sulfur. Fart Man realizes it is his own suit leaking toxic gas, and they share a quiet, embarrassed laugh as the sky turns to a deeper yellow.
                        </p>
                    </div>
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[8]} />
                    </div>
                </div>

                {/* CHAPTER X */}
                <div className="lore-chapter-row even-row">
                    <div className="lore-showcase-wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <ShowcaseCard char={featuredCharacters[9]} />
                    </div>
                    <div className="lore-chapter-text">
                        <div style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>
                            Chapter X
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
                            Garbage Collection Protocol
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '16px' }}>
                            When system anomalies grow too high and directories start to overlap, the mainframe triggers the cleanup protocol.
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            <strong>FuckingZILLA (P.F.P 75)</strong>, an apex predator of pure code, is initialized. He doesn't roar; he just makes a soft whirring hard-drive sound as he deletes entire sectors. High above, in orbit, the <strong>Space Guardian (P.F.P 76)</strong> watches, refusing to help because she isn't paid enough bytes to care.
                        </p>
                    </div>
                </div>

            </main>
        </div>
    );
}

export default function LorePage() {
    return (
        <Suspense fallback={
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading Lore...</p>
            </div>
        }>
            <LorePageContent />
        </Suspense>
    );
}

function ShowcaseCard({ char }: { char: FeaturedCharacter }) {
    return (
        <div className="banner-nft-card" style={{ maxWidth: '340px', width: '100%' }}>
            <div className="marquee-image-wrapper" style={{ width: '100%', aspectRatio: '1', borderRadius: '16px', overflow: 'hidden' }}>
                <img 
                    src={char.imageUrl} 
                    alt={char.charName} 
                    className="banner-nft-image"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>
            <div className="banner-nft-info" style={{ marginTop: '16px' }}>
                <div>
                    <div className="banner-nft-name" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                        {char.charName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {char.name} • Season {char.season}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div className="banner-nft-price" style={{ color: 'var(--accent-secondary)', fontSize: '0.85rem' }}>LORE</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {char.background}
                    </div>
                </div>
            </div>
            <div style={{ 
                borderTop: '1px solid rgba(255,255,255,0.06)', 
                marginTop: '12px', 
                paddingTop: '12px', 
                fontSize: '0.8rem', 
                color: 'var(--text-secondary)',
                lineHeight: 1.4,
                textAlign: 'left'
            }}>
                <strong>Mission:</strong> "{char.mission}"
            </div>
        </div>
    );
}
