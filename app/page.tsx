'use client';

import HeroBackground from '@/components/hero-background';
import HeroSection from '@/components/hero-section';

export default function Home() {
    return (
        <main className="min-h-screen bg-white text-neutral-900 font-sans selection:bg-neutral-100">
            <HeroBackground />

            {/* Hero Section */}
            <section className="relative z-10">
                <HeroSection />
            </section>
        </main>
    );
}
