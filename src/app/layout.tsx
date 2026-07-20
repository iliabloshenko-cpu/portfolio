import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from '../../site.config';
import YandexMetrica from '@/components/YandexMetrica';
import PortfolioAnalytics from '@/components/PortfolioAnalytics';

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
        <PortfolioAnalytics />
      </body>
    </html>
  );
}
