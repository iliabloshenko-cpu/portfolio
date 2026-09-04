import { getPage } from '@/lib/notion';
import NotionPage from '@/components/NotionPage';
import TelegramPin from '@/components/TelegramPin';
import { portfolioPages } from '../../../site.config';

const portfolioV3Config = portfolioPages.portfolioV3;

export default async function DesignManagerPage() {
  const recordMap = await getPage(portfolioV3Config.rootNotionPageId);

  return (
    <main>
      <TelegramPin />
      <NotionPage recordMap={recordMap} />
    </main>
  );
}

export const metadata = {
  title: portfolioV3Config.name,
  description: portfolioV3Config.description,
};
