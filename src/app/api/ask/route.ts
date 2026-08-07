import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı sunucu tarafında bulunamadı.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { originalText, summary, question } = body;

    if (!question || typeof question !== 'string' || !question.trim()) {
      return NextResponse.json(
        { error: 'Lütfen sormak istediğiniz soruyu girin.' },
        { status: 400 }
      );
    }

    if (!originalText || typeof originalText !== 'string' || !originalText.trim()) {
      return NextResponse.json(
        { error: 'Soru sorabilmek için önce bir metin özetlenmelidir.' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-flash-latest',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    });

    const prompt = `Sen uzman bir Türkçe metin analiz asistanısın. Aşağıda verilen orijinal metin ve özeti doğrultusunda kullanıcının sorusuna doğrudan, kısa ve öz bir yanıt ver.

Kurallar:
- Yanıtın kesinlikle net, doğru ve Türkçe olmalıdır.
- Giriş/gelişme tekerlemeleri yapma, doğrudan soruya cevap ver.
- Gereksiz dolgu cümleler kullanma.

Orijinal Metin:
"""
${originalText.trim()}
"""

Özet:
"""
${summary ? summary.trim() : ''}
"""

Soru: "${question.trim()}"

Yanıtın:`;

    const result = await model.generateContent(prompt);
    const answer = result.response.text().trim();

    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error('Gemini Q&A Hatası:', error);
    
    let userFriendlyError = 'Soru yanıtlanırken bir hata oluştu.';
    const msg = (error?.message || '').toLowerCase();

    if (msg.includes('429') || msg.includes('quota') || msg.includes('resource_exhausted')) {
      userFriendlyError = 'Gemini API şu an yoğun. Lütfen birkaç saniye sonra sorunuzu tekrar sorun.';
    } else if (msg.includes('503') || msg.includes('overloaded')) {
      userFriendlyError = 'Gemini servisi şu an meşgul. Lütfen yeniden deneyin.';
    }

    return NextResponse.json(
      { error: userFriendlyError },
      { status: 500 }
    );
  }
}
