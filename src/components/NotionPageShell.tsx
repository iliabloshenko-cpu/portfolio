'use client';

import dynamic from 'next/dynamic';
import { ExtendedRecordMap } from 'notion-types';

const NotionPage = dynamic(() => import('@/components/NotionPage'), {
  ssr: false,
});

interface NotionPageShellProps {
  recordMap: ExtendedRecordMap;
}

export default function NotionPageShell({ recordMap }: NotionPageShellProps) {
  return <NotionPage recordMap={recordMap} />;
}
