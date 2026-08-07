import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"], display: "swap" });

const siteUrl = "https://turkce-metin-ozetleyici.vercel.app";

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Türkçe Metin Özetleyici - Ücretsiz Yapay Zeka ile Metin Özetleme",
    template: "%s | Türkçe Metin Özetleyici",
  },
  description:
    "Uzun Türkçe metinlerinizi, makalelerinizi ve ödevlerinizi Google Gemini yapay zekası ile saniyeler içinde ücretsiz özetleyin, ana noktaları çıkarın ve sorular sorun.",
  keywords: [
    "türkçe metin özetleme",
    "metin özetleyici",
    "yapay zeka metin özetleme",
    "makale özetleme",
    "ücretsiz özet çıkarma",
    "pdf metin özetleme",
    "tez özetleme",
    "gemini ai özetleme",
  ],
  authors: [{ name: "Türkçe Metin Özetleyici" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Türkçe Metin Özetleyici - Ücretsiz Yapay Zeka ile Özet Çıkarma",
    description:
      "Uzun metinlerinizi saniyeler içinde 3-5 cümlelik kısa ve anlaşılır özetlere dönüştürün. Ücretsiz ve kayıt gerektirmez.",
    url: siteUrl,
    siteName: "Türkçe Metin Özetleyici",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Türkçe Metin Özetleyici - Ücretsiz Yapay Zeka Özetleme Aracı",
    description: "Google Gemini AI ile Türkçe metin özetleme ve akıllı soru-cevap uygulaması.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "googlee2c4fbaf79df1872",
  },
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Türkçe Metin Özetleyici",
  url: siteUrl,
  applicationCategory: "EducationalApplication",
  operatingSystem: "All",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TRY",
  },
  description:
    "Yapay zeka destekli ücretsiz Türkçe metin ve makale özetleme aracı. Metin özetleme, ana madde çıkarma ve soru-cevap sistemi sunar.",
  browserRequirements: "Requires JavaScript. Requires HTML5.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col selection:bg-indigo-500 selection:text-white`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
