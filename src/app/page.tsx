'use client';
import React from 'react';
import { HeroSection } from '@/components/sections/hero-section';
import { CTASection } from '@/components/sections/cta-section';
export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <CTASection />
        </main>
    );
}
