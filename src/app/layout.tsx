import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Türkçe Metin Özetleyici - Hızlı ve Kolay Metin Özetleme",
  description: "Uzun Türkçe metinlerinizi saniyeler içinde kısa özetlere ve ana noktalara dönüştürün.",
  keywords: ["türkçe metin özetleme", "metin özetleyici", "yapay zeka özet", "kısa özet", "madde madde özet"],
  authors: [{ name: "Türkçe Metin Özetleyici" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col selection:bg-indigo-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
