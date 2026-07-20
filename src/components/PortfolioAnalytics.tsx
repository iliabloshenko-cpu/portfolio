'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

const YM_COUNTER = 110863706;

const CASES = {
  personal_offers: {
    section: '305ca4341bfb8005b9c2db3ebb90b31c',
    result: '305ca4341bfb8051964cc22156f7da35',
  },
  pet_club: {
    section: '305ca4341bfb80308460d56721d2a5fa',
    result: '305ca4341bfb80a18bbad00507340107',
  },
  subscriptions: {
    section: '305ca4341bfb80c4af56e487ca994621',
    result: '305ca4341bfb808c83e2d37c6506cdbc',
  },
  re_registration: {
    section: '305ca4341bfb80cd8b84dea53b07dac7',
    result: '305ca4341bfb80698b33d7acff7619e4',
  },
} as const;

type CaseName = keyof typeof CASES;
type YandexMetrica = (
  counter: number,
  method: 'reachGoal',
  goal: string,
  params?: Record<string, string>,
) => void;

declare global {
  interface Window {
    ym?: YandexMetrica;
  }
}

export default function PortfolioAnalytics() {
  useEffect(() => {
    const fired = new Set<string>();
    const cleanups: Array<() => void> = [];

    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('internal') === '1' && posthog.__loaded) {
      posthog.setInternalOrTestUser();
      searchParams.delete('internal');

      const remainingSearch = searchParams.toString();
      window.history.replaceState(
        window.history.state,
        '',
        `${window.location.pathname}${remainingSearch ? `?${remainingSearch}` : ''}${window.location.hash}`,
      );
    }

    function capture(event: string, properties: Record<string, string>) {
      if (
        typeof posthog !== 'undefined' &&
        posthog.__loaded &&
        typeof posthog.capture === 'function'
      ) {
        posthog.capture(event, properties);
      }
    }

    function reachGoal(goal: string, params: Record<string, string>) {
      const ym = window.ym;
      if (typeof ym !== 'undefined') {
        ym(YM_COUNTER, 'reachGoal', goal, params);
      }
    }

    function fireOnce(key: string, callback: () => void) {
      if (fired.has(key)) return;
      fired.add(key);
      callback();
    }

    function observeOnce(
      element: HTMLElement | null,
      threshold: number,
      onEnter: () => void,
    ) {
      if (!element || typeof IntersectionObserver === 'undefined') return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          onEnter();
          observer.disconnect();
        },
        { threshold },
      );

      observer.observe(element);
      cleanups.push(() => observer.disconnect());
    }

    for (const [caseName, config] of Object.entries(CASES) as Array<
      [CaseName, (typeof CASES)[CaseName]]
    >) {
      observeOnce(document.getElementById(config.section), 0.2, () => {
        fireOnce(`case_viewed:${caseName}`, () => {
          capture('case_viewed', { case_name: caseName });
        });
      });

      observeOnce(document.getElementById(config.result), 0.1, () => {
        fireOnce(`case_read:${caseName}`, () => {
          const properties = { case_name: caseName };
          capture('case_read', properties);
          reachGoal('case_read', properties);
        });
      });
    }

    const hashToCase = new Map<string, CaseName>(
      (Object.entries(CASES) as Array<[CaseName, (typeof CASES)[CaseName]]>).map(
        ([caseName, config]) => [config.section, caseName],
      ),
    );
    const firstSection = document.getElementById(CASES.personal_offers.section);

    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')) {
      const href = link.getAttribute('href');
      const targetId = href?.split('#').at(-1)?.replaceAll('-', '');
      const caseName = targetId ? hashToCase.get(targetId) : undefined;
      if (!caseName || !firstSection) continue;

      const isAboveCases = Boolean(
        link.compareDocumentPosition(firstSection) & Node.DOCUMENT_POSITION_FOLLOWING,
      );
      if (!isAboveCases) continue;

      const onClick = () => {
        fireOnce(`menu_click:${caseName}`, () => {
          capture('menu_click', { case_name: caseName });
        });
      };
      link.addEventListener('click', onClick);
      cleanups.push(() => link.removeEventListener('click', onClick));
    }

    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href^="http"]')) {
      const destination = link.href;
      if (new URL(destination).hostname === 'iliabloshenko-cpu.github.io') continue;

      const onClick = () => {
        fireOnce('external_click:retro', () => {
          capture('external_click', { destination, case_name: 'retro' });
        });
      };
      link.addEventListener('click', onClick);
      cleanups.push(() => link.removeEventListener('click', onClick));
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return null;
}
