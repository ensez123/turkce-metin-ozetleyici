import React from 'react';
import { Sparkles, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="text-center space-y-4 sm:space-y-5">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold animate-glow-pulse">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span>Yapay Zeka Destekli Ücretsiz Metin Özetleme</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent leading-tight max-w-3xl mx-auto">
        Uzun Metinleri Saniyeler İçinde Anlaşılır Özetlere Dönüştürün
      </h2>

      <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
        Makaleleri, ders notlarını veya raporları saniyeler içinde 3-5 cümlelik net özetlere ve ana maddelere dönüştürün. Kayıt gerekmez, %100 ücretsiz.
      </p>

      {/* Social Proof & Trust Badges Bar */}
      <div className="flex flex-wrap justify-center items-center gap-2.5 sm:gap-3 pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>10.000+ Başarılı Özet</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Saniyeler İçinde Sonuç</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Kayıt Gerektirmez</span>
        </div>
      </div>
    </section>
  );
}
