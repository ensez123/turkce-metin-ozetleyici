import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SummarizerApp } from '@/components/SummarizerApp';
import { AboutSection } from '@/components/AboutSection';
import { AudienceCards } from '@/components/AudienceCards';
import { FaqSection } from '@/components/FaqSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 relative selection:bg-indigo-500 selection:text-white">
      {/* Modern Header */}
      <Header />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3.5 sm:px-4 py-8 sm:py-12 flex-1 w-full space-y-8 sm:space-y-10">
        {/* Above-the-Fold Hero Section (Server Rendered) */}
        <HeroSection />

        {/* Interactive App Boundary (Client Component) */}
        <SummarizerApp />

        {/* SEO Information & Interactive FAQ Accordion */}
        <div className="space-y-8">
          <AboutSection />
          <AudienceCards />
          <FaqSection />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
