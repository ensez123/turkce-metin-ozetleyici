import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
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
    
    // Optimized model config
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 1024,
      },
    });

    const prompt = `Aşağıdaki Türkçe metni dikkatlice özümse ve SADECE Türkçe olarak aşağıdaki JSON formatında yanıt ver:

{
  "summary": "Metnin tam 3 ile 5 cümle arasında, akıcı, net ve odaklanmış özeti.",
  "keyPoints": [
    "1. Önemli ana nokta",
    "2. Önemli ana nokta",
    "3. Önemli ana nokta",
    "4. Önemli ana nokta"
  ]
}

Kurallar:
- Yanıtınız tamamen geçerli ve hatasız bir JSON objesi olmalıdır.
- "summary" kesinlikle 3 ila 5 cümle olmalıdır. Gereksiz uzatmayın.
- "keyPoints" dizisi en az 3, en fazla 5 öz nokta içermelidir.
- Tüm anlatım net Türkçe olmalıdır.

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
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      responseText = fallbackResult.response.text().trim();
    }

    const cleanJsonText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    let parsedData: { summary: string; keyPoints: string[] };

    try {
      parsedData = JSON.parse(cleanJsonText);
    } catch (parseError) {
      console.error('Gemini JSON Parse Hatası:', parseError, cleanJsonText);
      return NextResponse.json(
        { error: 'Özet formatı işlenirken bir sorun oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    const originalWords = trimmedText.split(/\s+/).filter(Boolean).length;
    const summaryWords = parsedData.summary.split(/\s+/).filter(Boolean).length;
    const reductionPercentage = Math.max(
      5,
      Math.min(95, Math.round(((originalWords - summaryWords) / originalWords) * 100))
    );
    const estimatedReadTimeSeconds = Math.max(5, Math.ceil(summaryWords / 3.3));

    const finalResult: SummaryResult = {
      summary: parsedData.summary,
      keyPoints: parsedData.keyPoints,
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
