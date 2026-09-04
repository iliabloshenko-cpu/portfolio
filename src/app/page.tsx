import { getPage } from '@/lib/notion';
import NotionPage from '@/components/NotionPage';
import TelegramPin from '@/components/TelegramPin';
import { siteConfig } from '../../site.config';

export default async function Home() {
  const recordMap = await getPage(siteConfig.rootNotionPageId);

  return (
    <main>
      <TelegramPin />
      <NotionPage recordMap={recordMap} />
    </main>
  );
}

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};
