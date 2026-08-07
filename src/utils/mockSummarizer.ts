import { SummaryResult, SampleTextOption } from '@/types';

export const SAMPLE_TEXTS: SampleTextOption[] = [
  {
    id: 'teknoloji',
    title: 'Yapay Zekanın Geleceği',
    category: 'Teknoloji',
    text: `Yapay zeka teknolojileri, son yıllarda benzeri görülmemiş bir hızla gelişmekte ve günlük hayatımızın neredeyse her alanında kendine yer bulmaktadır. Sağlık sektöründe erken teşhis imkanları sunan algoritmalar, eğitimde kişiselleştirilmiş öğrenme deneyimleri ve sanayide otomasyon sistemleri sayesinde iş süreçleri köklü bir değişim yaşamaktadır.

Ancak bu hızlı dönüşüm, beraberinde birtakım etetik ve güvenlik tartışmalarını da getirmektedir. Veri gizliliği, algoritmik taraflılık ve iş gücü piyasasındaki olası değişimler, uzmanların üzerinde titizlikle durduğu temel konular arasında yer alıyor.

Önümüzdeki dönemde yapay zekanın insan yeteneklerini ikame etmek yerine destekleyici bir araç olarak konumlandırılması ve etik ilkeler çerçevesinde geliştirilmesi beklenmektedir.`
  },
  {
    id: 'bilim',
    title: 'İklim Değişikliği ve Okyanuslar',
    category: 'Çevre & Bilim',
    text: `Küresel iklim değişikliği, okyanus ekosistemleri üzerinde geri döndürülemez etkilere yol açmaktadır. Sıcaklık artışı nedeniyle eriyen buzullar deniz seviyelerinin yükselmesine neden olurken, emilen karbondioksit miktarı okyanusların asitlenmesini hızlandırmaktadır.

Bu durum mercan resiflerinden mikro organizmalara kadar binlerce deniz canlısının yaşam alanını tehdit ediyor. Okyanus sirkülasyonundaki bozulmalar ise sadece deniz yaşamını değil, dünya genelindeki hava olaylarını ve tarımsal üretimi de doğrudan etkilemektedir.

Bilim insanları, sera gazı emisyonlarının acilen azaltılması ve deniz koruma alanlarının genişletilmesi gerektiğini vurguluyor.`
  },
  {
    id: 'ekonomi',
    title: 'Dijital Dönüşüm ve İş Dünyası',
    category: 'Ekonomi',
    text: `Geleneksel iş modelleri, hızla ilerleyen dijitalleşme süreciyle birlikte kabuk değiştirmektedir. Şirketler, rekabet avantajını korumak ve müşteri beklentilerine yanıt verebilmek amacıyla bulut teknolojilerine, veri analitiğine ve mobil çözümlere yatırım yapmaktadır.

Uzaktan ve esnek çalışma modellerinin yaygınlaşması, kurumsal kültür ve insan kaynakları yönetimini de yeniden şekillendirmiştir. Dijital yetkinliklere sahip iş gücüne olan talep her geçen gün artarken, sürekli öğrenme kavramı çalışanlar için kritik bir unsur haline gelmiştir.

Geleceğin başarılı organizasyonları, teknolojik yenilikleri iş stratejilerine en hızlı adapte eden ve çalışanlarını bu yönde destekleyen şirketler olacaktır.`
  }
];

export async function summarizeText(text: string): Promise<SummaryResult> {
  // Simule edilmiş yapay zeka gecikmesi (1.2 saniye)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const originalWordCount = words.length;

  // Cümleleri ayır (Nokta, ünlem, soru işareti)
  const rawSentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  let summaryText = '';
  let keyPoints: string[] = [];

  // Eğer metin örnek metinlerimizden biriyse veya benzerse özelleştirilmiş sonuç dön
  const matchedSample = SAMPLE_TEXTS.find(
    (s) => trimmed.includes(s.title) || trimmed.slice(0, 50) === s.text.slice(0, 50)
  );

  if (matchedSample?.id === 'teknoloji') {
    summaryText = `Yapay zeka teknolojileri sağlık, eğitim ve sanayi gibi birçok alanda köklü dönüşümlere yol açarak hızla yaygınlaşmaktadır. Bu hızlı gelişim; veri gizliliği, etik sorunlar ve iş gücü piyasasına etkileri yönüyle de tartışılmaktadır. Gelecekte yapay zekanın insan yeteneklerini tamamlayıcı ve etik ilkelere uygun bir şekilde geliştirilmesi hedeflenmektedir.`;
    keyPoints = [
      'Yapay zeka sağlık, eğitim ve otomasyon alanlarında iş süreçlerini dönüştürmektedir.',
      'Veri gizliliği, taraflılık ve istihdam gibi etik endişeler gündemdedir.',
      'Yapay zekanın insanı ikame etmek yerine destekleyici araç olması beklenmektedir.',
      'Geliştirme süreçlerinde etik standartlar ve denetim mekanizmaları önem kazanmaktadır.'
    ];
  } else if (matchedSample?.id === 'bilim') {
    summaryText = `Küresel iklim değişikliği, okyanus sıcaklıklarının artması ve asitlenme nedeniyle deniz ekosistemlerini ciddi şekilde tehdit etmektedir. Buzulların erimesi ve sirkülasyon bozulmaları küresel hava olayları ile tarımı doğrudan etkilemektedir. Uzmanlar sera gazı emisyonlarının düşürülmesi ve deniz koruma alanlarının acilen artırılması gerektiğini ifade etmektedir.`;
    keyPoints = [
      'Deniz seviyelerindeki artış ve asitlenme deniz canlılarının yaşam alanlarını bozmaktadır.',
      'Okyanuslardaki değişimler küresel iklim ve tarımsal üretim üzerinde doğrudan etkilidir.',
      'Sera gazı emisyonlarının düşürülmesi ve koruma alanlarının artırılması gerekmektedir.'
    ];
  } else if (matchedSample?.id === 'ekonomi') {
    summaryText = `Dijitalleşme süreci, şirketlerin geleneksel iş modellerini değiştirerek bulut teknolojileri ve veri analitiğine yönelmelerini zorunlu kılmaktadır. Esnek çalışma modelleri kurumsal kültürü dönüştürürken dijital yetkinlik talebi yükselmiştir. Gelecekte teknolojik dönüşüme en hızlı uyum sağlayan firmalar öne çıkacaktır.`;
    keyPoints = [
      'Geleneksel şirketler bulut ve veri analitiği çözümleriyle dijitalleşmektedir.',
      'Uzaktan çalışma modelleri kurumsal yönetimi ve insan kaynaklarını yeniden şekillendirmiştir.',
      'Çalışanlar için sürekli öğrenme ve dijital beceriler zorunlu hale gelmiştir.',
      'Teknolojiye hızlı adapte olan organizasyonlar rekabet avantajı sağlayacaktır.'
    ];
  } else if (rawSentences.length >= 3) {
    // Genel metinler için akıllı mock özetleme algoritması
    const firstSentence = rawSentences[0];
    const middleSentence = rawSentences[Math.floor(rawSentences.length / 2)];
    const lastSentence = rawSentences[rawSentences.length - 1];

    summaryText = `${firstSentence} ${middleSentence} Genel olarak bakıldığında, metin vurgulanan temel noktalar çerçevesinde şekillenmekte ve bu alandaki gelişmelere dikkat çekmektedir. ${lastSentence}`;

    keyPoints = rawSentences.slice(0, 5).map((sentence, idx) => {
      // Cümleyi maddeye dönüştür
      let point = sentence.replace(/^[0-9.-]+\s*/, '');
      if (point.length > 90) {
        point = point.slice(0, 87) + '...';
      }
      return `${idx + 1}. Ana Fikir: ${point}`;
    });
  } else {
    // Kısa metinler için
    summaryText = `Metinde öne çıkan temel düşünce: ${trimmed.slice(0, 180)}${trimmed.length > 180 ? '...' : ''} Bu konu çerçevesinde belirtilen görüşler genel akışı oluşturmaktadır.`;
    keyPoints = [
      'Giriş bölümünde ana konu ve temel kavramlar sunulmaktadır.',
      'Metinde ifade edilen detaylar konu bütünlüğünü desteklemektedir.',
      'Sonuç olarak belirtilen değerlendirmeler genel çerçeveyi özetlemektedir.'
    ];
  }

  const summaryWords = summaryText.split(/\s+/).length;
  const reductionPercentage = Math.max(
    15,
    Math.min(85, Math.round(((originalWordCount - summaryWords) / originalWordCount) * 100))
  );
  
  // Ortalama okuma hızı: Dakikada 200 kelime -> saniyede ~3.3 kelime
  const estimatedReadTimeSeconds = Math.max(5, Math.ceil(summaryWords / 3.3));

  return {
    summary: summaryText,
    keyPoints,
    originalWordCount,
    summaryWordCount: summaryWords,
    reductionPercentage,
    estimatedReadTimeSeconds
  };
}
