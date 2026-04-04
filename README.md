# Портфолио Ильи Блошенко

Статический сайт-портфолио на базе Next.js, автоматически генерируемый из Notion страницы.

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Локальная разработка

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 3. Сборка для продакшн

```bash
npm run build
```

Статические файлы будут созданы в папке `out/`.

## 📦 Как работает проект

### Архитектура

1. **Notion API** — при сборке проект подключается к Notion через unofficial API (`notion-client`)
2. **Локальное скачивание изображений** — все изображения из Notion S3 скачиваются в `public/notion-images/` при билде
3. **Статическая генерация** — Next.js создает полностью статический сайт (HTML + CSS + JS)
4. **GitHub Actions** — автоматически деплоит на GitHub Pages при push в `main`

### Ключевые файлы

- **`site.config.ts`** — ID Notion страницы, название сайта, описание
- **`src/lib/notion.ts`** — клиент Notion API + скачивание изображений
- **`src/components/NotionPage.tsx`** — компонент рендеринга Notion страницы
- **`src/app/page.tsx`** — главная страница сайта
- **`.github/workflows/deploy.yml`** — CI/CD для GitHub Pages

## 🔄 Обновление контента

Когда обновляешь контент в Notion:

1. **Автоматический деплой** — просто push в `main`:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```

2. **Ручной деплой** без изменений кода:
   - Зайди в GitHub → Actions
   - Выбери "Deploy to GitHub Pages"
   - Нажми "Run workflow"

## ⚙️ Настройка GitHub Pages

1. Создай репозиторий на GitHub (например, `portfolio`)
2. Зайди в Settings → Pages
3. Source: выбери **"GitHub Actions"**
4. Push код в `main` — деплой запустится автоматически

### Важно про basePath

Если репозиторий называется **НЕ** `username.github.io`:

1. Открой `next.config.ts`
2. Раскомментируй строку:
   ```typescript
   basePath: "/portfolio",  // замени "portfolio" на имя твоего репозитория
   ```
3. Сайт будет доступен по `username.github.io/portfolio`

Если репозиторий называется `username.github.io` — `basePath` не нужен.

## 🎨 Кастомизация

### Изменить Notion страницы

Отредактируй `site.config.ts`:

```typescript
export const portfolioPages = {
  main: {
    path: '/',
    rootNotionPageId: 'page-id-для-основного-портфолио',
    name: 'Основное портфолио',
    description: 'Описание основного портфолио',
    author: 'Илья Блошенко',
  },
  portfolioV2: {
    path: '/portfolio-v2',
    rootNotionPageId: 'page-id-для-второго-варианта',
    name: 'Portfolio v2',
    description: 'Описание второго варианта',
    author: 'Илья Блошенко',
  },
};
```

Основное портфолио остаётся на `/`, второй вариант доступен на `/portfolio-v2/`.

### Адаптивные стили

Отредактируй `src/app/globals.css` — там настройки для мобильных экранов.

## 🛠️ Технологии

- **Next.js 16** — App Router, Static Export
- **react-notion-x** — рендеринг Notion блоков
- **notion-client** — unofficial Notion API
- **GitHub Pages** — хостинг (бесплатно, работает в РФ)
- **GitHub Actions** — CI/CD

## 📝 Лицензия

MIT
