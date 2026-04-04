import { getPage } from '@/lib/notion';
import NotionPage from '@/components/NotionPage';
import { portfolioPages } from '../../../site.config';

const portfolioV2Config = portfolioPages.portfolioV2;

export default async function PortfolioV2Page() {
  const recordMap = await getPage(portfolioV2Config.rootNotionPageId);

  return (
    <main>
      <NotionPage recordMap={recordMap} />
    </main>
  );
}

export const metadata = {
  title: portfolioV2Config.name,
  description: portfolioV2Config.description,
};
