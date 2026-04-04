export type PortfolioPageConfig = {
  path: string;
  rootNotionPageId: string;
  name: string;
  description: string;
  author: string;
};

export const portfolioPages = {
  main: {
    path: '/',
    // ID корневой Notion-страницы основного портфолио
    // Источник: https://www.notion.so/b04fc9185da54bfb8bb916519ee689d7
    rootNotionPageId: 'b04fc9185da54bfb8bb916519ee689d7',
    name: 'Илья Блошенко — Senior Product Designer',
    description:
      'Продуктовый дизайнер, 8 лет опыта. Программа лояльности Ленты, подписки, персональные предложения.',
    author: 'Илья Блошенко',
  },
  portfolioV2: {
    path: '/portfolio-v2',
    // Источник: https://rocky-papaya-a71.notion.site/338ca4341bfb80b6a8dec936f6d5236b
    rootNotionPageId: '338ca4341bfb80b6a8dec936f6d5236b',
    name: 'Блошенко Илья — Portfolio v2',
    description: 'Второй вариант портфолио Ильи Блошенко.',
    author: 'Илья Блошенко',
  },
} satisfies Record<string, PortfolioPageConfig>;

export const siteConfig = portfolioPages.main;
