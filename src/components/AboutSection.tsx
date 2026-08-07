import React from 'react';
import { BookOpen } from 'lucide-react';

export function AboutSection() {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 flex flex-col gap-4">
      <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
        <BookOpen className="size-6 text-indigo-400" aria-hidden="true" />
        <span>Türkçe Metin Özetleyici Nedir?</span>
      </h2>
      <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
        <strong>Türkçe Metin Özetleyici</strong>, uzun akademik makaleleri, ders notlarını, haberleri ve karmaşık metinleri Google Gemini yapay zekası desteğiyle saniyeler içinde anlaşılır özetlere dönüştüren ücretsiz bir online araçtır. Metninizin özünü koruyarak 3–5 cümlelik kısa özet çıkarır ve önemli vurguları madde madde sunar.
      </p>
    </div>
  );
}
