import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SummaryResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı sunucu tarafında bulunamadı (.env.local kontrol edin).' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json(
        { error: 'Lütfen özetlenecek metni gönderin.' },
        { status: 400 }
      );
    }

    const trimmedText = text.trim();
    if (trimmedText.length < 25) {
      return NextResponse.json(
        { error: 'Metin çok kısa. Anlamlı bir özet için lütfen en az 1-2 cümle metin girin.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Çalışan güncel model: gemini-flash-latest
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const prompt = `Aşağıdaki Türkçe metni dikkatlice oku, özümse ve SADECE Türkçe olarak aşağıdaki JSON formatında yanıt ver:

{
  "summary": "Metnin 3 ile 5 cümle arasında, akıcı ve öz net bir özeti.",
  "keyPoints": [
    "Metinden çıkarılan 1. ana nokta veya önemli bilgi",
    "Metinden çıkarılan 2. ana nokta veya önemli bilgi",
    "Metinden çıkarılan 3. ana nokta veya önemli bilgi",
    "Metinden çıkarılan 4. ana nokta veya önemli bilgi"
  ]
}

Önemli Kurallar:
- Yanıtınız kesinlikle geçerli ve hatasız bir JSON objesi olmalıdır.
- "summary" alanı kesinlikle 3 ila 5 cümle olmalıdır.
- "keyPoints" dizisi en az 3, en fazla 6 madde içermelidir.
- Tüm anlatım Türkçe olmalıdır.

Özetlenecek Metin:
"""
${trimmedText}
"""`;

    let responseText = '';
    try {
      const result = await model.generateContent(prompt);
      responseText = result.response.text().trim();
    } catch (modelErr: any) {
      console.warn('gemini-flash-latest hatası, fallback gemini-flash-lite-latest deneniyor...', modelErr);
      const fallbackModel = genAI.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      responseText = fallbackResult.response.text().trim();
    }

    // Clean markdown code fences if present
    const cleanJsonText = responseText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    let parsedData: { summary: string; keyPoints: string[] };

    try {
      parsedData = JSON.parse(cleanJsonText);
    } catch (parseError) {
      console.error('Gemini JSON Parse Hatası:', parseError, cleanJsonText);
      return NextResponse.json(
        { error: 'Gemini yanıtı işlenirken bir biçim hatası oluştu. Lütfen tekrar deneyin.' },
        { status: 500 }
      );
    }

    // Kelime istatistiklerini hesapla
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
    const errorMessage = error?.message || 'Gemini API ile iletişim kurulurken bir hata oluştu.';
    return NextResponse.json(
      { error: `Gemini API Hatası: ${errorMessage}` },
      { status: 500 }
    );
  }
}
