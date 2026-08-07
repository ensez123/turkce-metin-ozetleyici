import React from 'react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-xs text-slate-400">
      <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>© {new Date().getFullYear()} Türkçe Metin Özetleyici. Tüm hakları saklıdır.</p>
        <p className="text-slate-500">Google Gemini AI & Next.js App Router ile güçlendirilmiştir.</p>
      </div>
    </footer>
  );
}
