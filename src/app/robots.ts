import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Bingbot',
          'GoogleOther',
        ],
        allow: '/',
      },
    ],
    sitemap: 'https://turkce-metin-ozetleyici.vercel.app/sitemap.xml',
  };
}

