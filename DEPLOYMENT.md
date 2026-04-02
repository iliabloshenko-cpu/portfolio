# Инструкция по деплою на GitHub Pages

## 1. Создание GitHub репозитория

### Вариант A: Репозиторий с кастомным именем (например, `portfolio`)

1. Зайди на [GitHub](https://github.com) и создай новый публичный репозиторий
2. Назови его `portfolio` (или любое другое имя)
3. **НЕ** инициализируй README, .gitignore или лицензию (они уже есть локально)
4. **ВАЖНО:** Открой `next.config.ts` и раскомментируй строку:
   ```typescript
   basePath: "/portfolio",  // замени "portfolio" на имя твоего репозитория
   ```
5. Пересобери проект: `npm run build`

### Вариант B: Репозиторий с именем `username.github.io`

1. Создай репозиторий с именем **точно** `username.github.io` (замени `username` на свой GitHub username)
2. В этом случае `basePath` в `next.config.ts` **НЕ НУЖЕН** (можно оставить закомментированным)
3. Сайт будет доступен напрямую по `username.github.io`

## 2. Инициализация Git и первый коммит

Выполни команды:

```bash
# Убедись, что git уже инициализирован (create-next-app делает это автоматически)
git status

# Если не инициализирован:
# git init

# Добавь все файлы
git add .

# Создай первый коммит
git commit -m "Initial commit: Notion portfolio site"

# Подключи удалённый репозиторий (замени username и portfolio на свои)
git remote add origin https://github.com/username/portfolio.git

# Переименуй ветку в main (если она называется master)
git branch -M main

# Отправь код в GitHub
git push -u origin main
```

## 3. Настройка GitHub Pages

1. Зайди в свой репозиторий на GitHub
2. Перейди в **Settings** (⚙️ справа вверху)
3. В левом меню выбери **Pages**
4. В разделе **Source** выбери **GitHub Actions** (НЕ Deploy from a branch!)
5. Нажми **Save**

## 4. Автоматический деплой

GitHub Actions автоматически запустится при push в `main`:

1. Перейди в **Actions** (вкладка вверху)
2. Дождись завершения workflow "Deploy to GitHub Pages" (обычно 2-3 минуты)
3. Зелёная галочка ✅ означает успешный деплой
4. Сайт будет доступен по адресу:
   - Если репозиторий `portfolio`: `https://username.github.io/portfolio/`
   - Если репозиторий `username.github.io`: `https://username.github.io/`

### Лендинг как отдельная страница

- Папка `landing/` автоматически копируется в `public/landing/` при `npm run dev` и `npm run build`
- После деплоя лендинг будет доступен по адресу:
  - `https://username.github.io/portfolio/landing/`
  - или `https://username.github.io/landing/` для репозитория `username.github.io`

## 5. Обновление контента из Notion

### Автоматическое обновление при изменении кода:

```bash
git add .
git commit -m "Update content"
git push
```

### Ручное обновление без изменения кода:

1. Зайди в **Actions** на GitHub
2. Выбери workflow "Deploy to GitHub Pages"
3. Нажми **Run workflow** → **Run workflow**
4. Дождись завершения (сайт пересоберётся с актуальными данными из Notion)

## 6. Проверка работы сайта

После деплоя:

1. Открой URL сайта в браузере
2. Проверь:
   - ✅ Все изображения загружаются (из локальной папки `notion-images`)
   - ✅ Внутренние ссылки (оглавление) работают
   - ✅ Внешние ссылки на Behance открываются
   - ✅ Мобильная вёрстка корректна (открой в DevTools → Toggle device toolbar)

## Troubleshooting

### Проблема: 404 при открытии сайта

**Решение:**
1. Проверь, что в Settings → Pages выбран **GitHub Actions**
2. Убедись, что workflow завершился успешно (зелёная галочка)
3. Проверь правильность `basePath` в `next.config.ts`

### Проблема: Изображения не загружаются

**Решение:**
1. Проверь, что Notion-страница опубликована (Share → Publish to web)
2. Перезапусти сборку (`npm run build`) и проверь, что в `public/notion-images/` появились файлы
3. Если файлов нет, проверь логи билда на предупреждения `[notion] Failed to download image`

### Проблема: Контент не обновляется после изменений в Notion

**Решение:**
1. Зайди в Actions → Run workflow (принудительный пересборка)
2. Или сделай любой коммит (например, в README.md) и push

## Кастомный домен (опционально)

Если хочешь использовать свой домен (например, `myportfolio.com`):

1. Купи домен (Reg.ru, Timeweb, Namecheap)
2. Зайди в Settings → Pages → Custom domain
3. Введи домен и нажми Save
4. В настройках DNS домена добавь CNAME запись:
   ```
   CNAME  @  username.github.io.
   ```
5. Дождись обновления DNS (до 24 часов, обычно 1-2 часа)
6. GitHub автоматически выпустит SSL-сертификат (HTTPS)

## Отладка локально

Перед пушем в GitHub всегда можно проверить сайт локально:

```bash
# Development (с hot-reload)
npm run dev
# Открыть http://localhost:3000

# Production build (как на GitHub Pages)
npm run build
# Статические файлы будут в папке out/

# Просмотр статики локально
npx serve out
# Открыть http://localhost:3000
```

---

## Готово! 🎉

Теперь твоё портфолио доступно в интернете, работает из России без VPN, и обновляется одной кнопкой при изменении Notion-страницы.
