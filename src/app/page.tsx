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
      {/* Skip link for Accessibility & Keyboard Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
      >
        İçeriğe Atla
      </a>

      {/* Modern Header */}
      <Header />

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="max-w-4xl mx-auto px-3.5 sm:px-4 py-8 sm:py-12 flex-1 w-full space-y-8 sm:space-y-10 outline-none">
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
