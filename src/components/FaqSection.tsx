import React from 'react';
import { HelpCircle } from 'lucide-react';
import { FaqAccordion, FaqItem } from './FaqAccordion';

const FAQ_ITEMS: FaqItem[] = [
  {
    q: '1. Türkçe metin özetleyici ücretsiz mi?',
    a: 'Evet, Türkçe Metin Özetleyici tamamen ücretsizdir. Üyelik açmadan veya kredi kartı girmeden dilediğiniz kadar Türkçe metni saniyeler içinde özetleyebilirsiniz.'
  },
  {
    q: '2. Hangi yapay zeka teknolojisi kullanılıyor?',
    a: 'Uygulamamız Google Gemini AI altyapısını kullanmaktadır. Gelişmiş doğal dil işleme (NLP) yeteneği sayesinde Türkçe metinleri bağlamından koparmadan 3-5 cümlelik özetlere ve ana maddelere dönüştürür.'
  },
  {
    q: '3. Hangi tür metinleri özetleyebilirim?',
    a: 'Akademik makaleler, ders notları, haber yazıları, kitap özetleri, iş raporları ve e-postalar dahil 4.000 karaktere kadar olan tüm Türkçe metinleri özetleyebilirsiniz.'
  },
  {
    q: '4. Özetlenen metin hakkında nasıl soru sorabilirim?',
    a: 'Özet hazırlandıktan sonra açılan "Akıllı Soru-Cevap" bölümünden metnin detayları, ana fikri veya anlamadığınız noktaları hakkında doğrudan yapay zekaya sorular sorabilirsiniz.'
  },
  {
    q: '5. Verilerim ve metinlerim saklanıyor mu?',
    a: 'Metinleriniz ve sorduğunuz sorular hiçbir şekilde veritabanlarımızda kaydedilmez veya saklanmaz. Tüm işlemler anlık olarak gerçekleşir ve gizliliğiniz güvendedir.'
  }
];

export function FaqSection() {
  return (
    <section id="sss-section" className="pt-10 border-t border-slate-800/80 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ_ITEMS.map((item) => ({
              "@type": "Question",
              name: item.q.replace(/^\d+\.\s*/, ''),
              acceptedAnswer: {
                "@type": "Answer",
                text: item.a,
              },
            })),
          }),
        }}
      />

      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-slate-700/60 space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100">Sıkça Sorulan Sorular (SSS)</h2>
            <p className="text-xs text-slate-400">Türkçe Metin Özetleyici hakkında merak edilen tüm sorular ve yanıtları</p>
          </div>
        </div>

        <FaqAccordion items={FAQ_ITEMS} />
      </div>
    </section>
  );
}
