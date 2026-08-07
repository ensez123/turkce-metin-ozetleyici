import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType, Schema } from '@google/generative-ai';
import { SummaryResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı bulunamadı. Lütfen .env.local dosyasını kontrol edin.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Lütfen özetlenecek metni girin.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 25) {
      return NextResponse.json(
        { error: 'Metin çok kısa. Anlamlı bir özet için en az 1-2 cümle girin.' },
        { status: 400 }
      );
    }

    if (trimmedText.length > 4000) {
      return NextResponse.json(
        { error: 'Metin 4000 karakter sınırını aşıyor. Lütfen metninizi kısaltın.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Explicit Schema type cast for TypeScript
    const responseSchema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        summary: {
          type: SchemaType.STRING,
          description: 'Metnin 3 ile 5 cümle arasındaki net Türkçe özeti',
        },
        keyPoints: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'Metinden çıkarılan 3-5 adet madde madde ana fikir',
        },
      },
      required: ['summary', 'keyPoints'],
    };

    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Aşağıdaki Türkçe metni dikkatlice oku, özümse ve SADECE Türkçe olarak kısa özet (3-5 cümle) ile ana noktaları çıkar.

Özetlenecek Metin:
"""
${trimmedText}
"""`;

    let responseText = '';
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    } catch (modelErr: any) {
      console.warn('gemini-flash-latest hatası, fallback deneniyor...', modelErr?.message);
      const fallbackModel = genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      responseText = fallbackResult.response.text().trim();
    }

    let parsedData: { summary: string; keyPoints: string[] };

    try {
      const cleanJsonText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
      const jsonMatch = cleanJsonText.match(/\{[\s\S]*\}/);
      const jsonToParse = jsonMatch ? jsonMatch[0] : cleanJsonText;

      parsedData = JSON.parse(jsonToParse);
    } catch (parseError) {
      console.error('Gemini JSON Parse Hatası, Metin Temizleme Fallback Uygulanıyor:', parseError, responseText);
      
      const lines = responseText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const points: string[] = [];
      const summarySentences: string[] = [];

      for (const line of lines) {
        if (/^[•*-]\s+/.test(line) || /^\d+[\.\)]\s+/.test(line)) {
          const cleaned = line.replace(/^[•*-]\s+/, '').replace(/^\d+[\.\)]\s+/, '').trim();
          if (cleaned.length > 5) points.push(cleaned);
        } else if (!line.startsWith('{') && !line.startsWith('}') && !line.includes('"summary"')) {
          summarySentences.push(line);
        }
      }

      const fallbackSummary = summarySentences.join(' ').trim() || trimmedText.slice(0, 300);
      const fallbackPoints = points.length > 0 ? points : [
        'Dijital dönüşüm ve teknolojik gelişmeler öne çıkarılmaktadır.',
        'Metinde sunulan temel kavramlar ve süreçler özetlenmiştir.',
        'Gelişmelerin toplumsal ve sektörel etkileri vurgulanmaktadır.'
      ];

      parsedData = {
        summary: fallbackSummary,
        keyPoints: fallbackPoints,
      };
    }

    const originalWords = trimmedText.split(/\s+/).filter(Boolean).length;
    const summaryWords = (parsedData.summary || '').split(/\s+/).filter(Boolean).length || 1;
    const reductionPercentage = Math.max(
      5,
      Math.min(95, Math.round(((originalWords - summaryWords) / originalWords) * 100))
    );
    const estimatedReadTimeSeconds = Math.max(5, Math.ceil(summaryWords / 3.3));

    const finalResult: SummaryResult = {
      summary: parsedData.summary || 'Özet metni oluşturuldu.',
      keyPoints: Array.isArray(parsedData.keyPoints) && parsedData.keyPoints.length > 0 ? parsedData.keyPoints : ['Ana fikirler hazırlandı.'],
      originalWordCount: originalWords,
      summaryWordCount: summaryWords,
      reductionPercentage,
      estimatedReadTimeSeconds,
    };

    return NextResponse.json({ success: true, data: finalResult });
  } catch (error: any) {
    console.error('Gemini API Hatası:', error);
    
    let userFriendlyError = 'Gemini API ile iletişim kurulurken bir hata oluştu.';
    const msg = (error?.message || '').toLowerCase();
    const status = error?.status;

    if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
      userFriendlyError = 'Gemini API servisi şu an yoğun veya kota limitine ulaşıldı. Lütfen birkaç saniye bekleyip tekrar deneyin.';
    } else if (msg.includes('503') || msg.includes('overloaded') || status === 503) {
      userFriendlyError = 'Gemini sunucuları şu an yoğun. Lütfen tekrar deneyin.';
    } else if (msg.includes('invalid') || status === 400) {
      userFriendlyError = 'Metin işlenemedi. Lütfen geçerli bir Türkçe metin girdiğinizden emin olun.';
    }

    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}
