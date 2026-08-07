import React from 'react';

export function AudienceCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          🎓 Öğrenciler & Akademisyenler
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Yüzlerce sayfalık tezleri, akademik makaleleri ve ders notlarını hızlıca analiz edin. Sınavlara ve araştırmalara zamandan tasarruf ederek hazırlanın.
        </p>
      </div>

      <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          💼 Profesyoneller & İş Dünyası
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Uzun iş raporlarını, e-postaları ve sektör analizlerini saniyeler içinde okuyup karar alma süreçlerinizi hızlandırın.
        </p>
      </div>

      <div className="glass-card glass-card-hover rounded-xl p-5 border border-slate-700/60 space-y-2">
        <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
          ✍️ İçerik Üreticileri & Yazarlar
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Haberlerin, kaynak yazıların ve rakip içeriklerin ana noktalarını saniyeler içinde çıkararak içerik üretim sürecinizi verimli kılın.
        </p>
      </div>
    </div>
  );
}
