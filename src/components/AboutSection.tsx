import React from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';

export function AboutSection() {
  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <BookOpen className="size-6 text-indigo-400" aria-hidden="true" />
          <span>Türkçe Metin Özetleyici Nedir?</span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-pretty">
          <strong>Türkçe Metin Özetleyici</strong>; akademik makaleler, ders notları, iş raporları ve haber yazıları gibi uzun Türkçe metinleri Google Gemini yapay zekası altyapısıyla saniyeler içinde 3–5 cümlelik kısa ve anlaşılır özetlere dönüştüren ücretsiz bir web uygulamasıdır. Metninizin ana fikirlerini madde madde çıkarır ve metin üzerinden doğrudan soru sormanızı sağlar.
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-300">
        <div className="flex items-start gap-2">
          <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span><strong>Tamamen Ücretsiz:</strong> Kayıt veya üyelik gerektirmeden anında özet çıkarma.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span><strong>Gemini AI Altyapısı:</strong> Gelişmiş doğal dil işleme ile yüksek doğrulukta Türkçe analizi.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span><strong>Akıllı Soru-Cevap:</strong> Özet metin detayları hakkında yapay zekaya özel sorular sorma.</span>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="size-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <span><strong>Gizlilik & Güvenlik:</strong> Metinleriniz hiçbir şekilde kaydedilmez veya veritabanında saklanmaz.</span>
        </div>
      </div>
    </div>
  );
}

