'use client';

import React from 'react';
import { defaultMapImageUrl } from 'notion-utils';
import { NotionRenderer } from 'react-notion-x';
import { ExtendedRecordMap } from 'notion-types';
import { useEffect } from 'react';

// Стили react-notion-x
import 'react-notion-x/src/styles.css';
// Подсветка кода
import 'prismjs/themes/prism-tomorrow.css';

// Тяжёлые компоненты — подключать лениво
import dynamic from 'next/dynamic';

const LOCAL_IMAGE_ORIGIN = 'https://notion-local.host';
const PUBLIC_BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then((m) => m.Code)
);
const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then((m) => m.Collection)
);
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
);

interface NotionPageProps {
  recordMap: ExtendedRecordMap;
}

export default function NotionPage({ recordMap }: NotionPageProps) {
  useEffect(() => {
    const links = document.querySelectorAll<HTMLAnchorElement>('a.notion-link[href^="#"]');
    for (const link of links) {
      const href = link.getAttribute('href');
      if (!href) continue;

      const match = href.match(/^#[0-9a-f-]{32}#([0-9a-f-]{32})$/i);
      if (!match) continue;

      const targetId = match[1].replace(/-/g, '');
      link.setAttribute('href', `#${targetId}`);
    }
  }, [recordMap]);

  const mapLocalImageUrl = (url: string) => {
    const parsed = new URL(url);
    return `${PUBLIC_BASE_PATH}${parsed.pathname}${parsed.search}`;
  };

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      darkMode={false}
      showTableOfContents={false}
      components={{
        Code,
        Collection,
        Equation,
      }}
      // Портфолио одно-страничное: любые Notion page-ссылки сводим к якорям блоков.
      mapPageUrl={() => ''}
      mapImageUrl={(url, block) => {
        if (typeof url === 'string' && url.startsWith(LOCAL_IMAGE_ORIGIN)) {
          return mapLocalImageUrl(url);
        }

        const signedUrl =
          typeof url === 'string' && url.startsWith('attachment:')
            ? recordMap.signed_urls?.[block.id]
            : undefined;
        const mappedUrl = signedUrl ?? defaultMapImageUrl(url, block) ?? url;

        if (!mappedUrl) {
          return mappedUrl;
        }

        if (mappedUrl.startsWith(LOCAL_IMAGE_ORIGIN)) {
          return mapLocalImageUrl(mappedUrl);
        }

        return mappedUrl;
      }}
    />
  );
}
