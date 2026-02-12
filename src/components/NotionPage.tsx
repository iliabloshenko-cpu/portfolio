'use client';

import React from 'react';
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

  return (
    <NotionRenderer
      recordMap={recordMap}
      fullPage={true}
      darkMode={false}
      components={{
        Code,
        Collection,
        Equation,
      }}
      // Портфолио одно-страничное: любые Notion page-ссылки сводим к якорям блоков.
      mapPageUrl={() => ''}
      mapImageUrl={(url) => {
        if (!url) {
          return url;
        }
        if (url.startsWith(LOCAL_IMAGE_ORIGIN)) {
          return url.replace(LOCAL_IMAGE_ORIGIN, '');
        }
        return url;
      }}
    />
  );
}
