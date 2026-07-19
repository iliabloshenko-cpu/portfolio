import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from '../../site.config';
import YandexMetrica from '@/components/YandexMetrica';

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <YandexMetrica />
        {children}
      </body>
    </html>
  );
}
