import { getPage } from '@/lib/notion';
import NotionPageShell from '@/components/NotionPageShell';
import { siteConfig } from '../../site.config';

export default async function Home() {
  const recordMap = await getPage(siteConfig.rootNotionPageId);

  return (
    <main>
      <NotionPageShell recordMap={recordMap} />
    </main>
  );
}

export const metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};
