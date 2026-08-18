# NTS Sketch Map Editor

Стартовий каркас проекту. Повна специфікація — див. `SPEC.md` у корені репозиторію
(додати поруч із цим README, якщо ще не додано).

## Статус каркаса

Це **Фаза 1 (Foundation)** зі SPEC.md — компілюється, показує Calcite Shell з вкладками
Map/Layout, ініціює OAuth2-логін і завантажує WebMap. Функціонал редагування (Фаза 2)
та Layout (Фази 3–5) — заглушки з TODO-коментарями, орієнтовані на подальшу розробку
через Claude Code.

## Встановлення

```bash
npm install
npm run dev
```

## Перед першим запуском: перевірити OAuth redirect URI

В Application item на Portal (`https://gis.htgoims.org/portal`, client_id `I2nM1oIsuu2NcMi9`)
має бути зареєстрований redirect URI, що **точно** збігається з адресою, звідки запускається
додаток:

- Локально: `http://localhost:5173` (і, можливо, `http://localhost:5173/` — з trailing slash)
- Прод (GitHub Pages): `https://haloukrainegis.github.io/NTS_Sketch_map/`
  (замінити `<username>` і, за потреби, назву репозиторію — узгодити з `base` у `vite.config.ts`)

Якщо після логіну повертає помилку "invalid redirect_uri" — це майже завжди
невідповідність trailing slash або http/https.

## Деплой на GitHub Pages

1. Перевірити, що `vite.config.ts` → `base` відповідає назві репозиторію.
2. `npm run deploy` (використовує пакет `gh-pages`, публікує вміст `dist/` у гілку `gh-pages`).
3. У налаштуваннях репозиторію GitHub → Pages → Source: гілка `gh-pages`.

## Структура проекту

```
/src
  /app        — App shell, AuthGate
  /map        — єдиний MapView (useMapView, MapViewContext, MapContainer)
  /editor     — UI режиму "Map" (редагування об'єктів)
  /layout     — UI режиму "Layout" (компонування для друку + export)
  /auth       — OAuth2 / IdentityManager
  /store      — Zustand store (спільний стан Map/Layout)
  /config     — env.ts — усі URL/ID/списки значень, нічого не хардкодити в компонентах
```

## Ключовий архітектурний принцип

**Один MapView на весь застосунок.** Перемикання вкладок Map/Layout не пересоздає карту —
див. `src/map/MapContainer.tsx`, де обидва UI-шари змонтовані одночасно й перемикається
лише `display`. Не порушувати цей принцип при подальшій розробці — саме він забезпечує
швидке перемикання без "смикання" карти.

## Наступні кроки для Claude Code

Дивитись TODO-коментарі в порядку:
1. `src/editor/MapModeUI.tsx` — Sketch + FeatureForm редагування (Фаза 2).
2. `src/layout/LayoutModeUI.tsx` — A4LayoutFrame, DraggableLegend, DraggableTextTable (Фази 3–4).
3. `src/layout/exportEngine.ts` (ще не створено) — takeScreenshot + композинг у JPG (Фаза 5).

Схему полів шару `Evidence_for_sketch_map` (`fields`, `domains`, `capabilities`)
зчитувати динамічно з `{FeatureServer_URL}/0?f=json` — недоступно ззовні на етапі
написання цього каркаса, тому в коді не захардкожено.
