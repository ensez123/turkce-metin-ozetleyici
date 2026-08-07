import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
    const { originalText, summary, question } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Lütfen metin hakkında sormak istediğiniz soruyu girin.' },
        { status: 400 }
      );
    }

    if (!originalText || typeof originalText !== 'string' || !originalText.trim()) {
      return NextResponse.json(
        { error: 'Soru sorabilmek için önce bir metin özetlenmiş olmalıdır.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.4,
      },
    });

    const prompt = `Aşağıda orijinal Türkçe metin ve bu metnin kısa özeti verilmiştir. Kullanıcının metinle alakalı sorduğu soruyu dikkatle değerlendir ve metne/özete sadık kalarak tamamen Türkçe olarak net, anlaşılır ve açıklayıcı bir yanıt ver.

Orijinal Metin:
"""
${originalText.trim()}
"""

Kısa Özet:
"""
${summary ? summary.trim() : ''}
"""

Kullanıcının Sorusu:
"${question.trim()}"

Lütfen doğrudan soruya odaklanan açıklayıcı yanıtını Türkçe olarak yaz:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error('Gemini Q&A Hatası:', error);
    const errorMessage = error?.message || 'Soru yanıtlanırken bir hata oluştu.';
    return NextResponse.json(
      { error: `Soru Yanıtlanamadı: ${errorMessage}` },
      { status: 500 }
    );
  }
}
