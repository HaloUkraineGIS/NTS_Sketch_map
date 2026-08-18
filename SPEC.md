# Специфікація проекту: A4 Print Map Editor

## 1. Опис проекту

Веб-додаток для непрофесійних користувачів ArcGIS, що дозволяє:
1. Редагувати/створювати геооб'єкти у попередньо підготовлених feature services на веб-карті.
2. Готувати цю ж карту до друку у форматі A4: обирати орієнтацію, типовий масштаб, систему координат (UTM-зони для України), розташування легенди, — і експортувати результат у зображення.

Ключова вимога: **додаток має бути легким і швидким**, без дублювання карти між режимами й без зайвих важких залежностей.

## 2. Дані та середовище

- **Portal (ArcGIS Enterprise):** `https://gis.htgoims.org/portal`
- **Application item (OAuth2 Client):** `client_id = I2nM1oIsuu2NcMi9`
- **Веб-карта (WebMap item):** `id = 942c8a52de5e445c932aaa94295afbaf`
  URL: `https://gis.htgoims.org/portal/home/item.html?id=942c8a52de5e445c932aaa94295afbaf`
- **Feature Service для векторизації:** `https://gis.htgoims.org/server/rest/services/Hosted/Evidence_for_sketch_map/FeatureServer`
- **Хостинг фронтенду:** GitHub Pages (статичний, без бекенду)
- **Автентифікація:** SSO через Portal (SAML/corporate IdP за IdentityManager), не всі користувачі мають права на редагування — права визначаються на рівні `capabilities` шару в Portal, а не власною системою ролей.

**Схема шару `Evidence_for_sketch_map` (layer 0):**
- Тип геометрії: **точка (Point)**
- Атрибути: `name` (текст), `ev_type` (тип/категорія об'єкта — ймовірно coded value domain, перевірити під час розробки)

> ⚠️ Примітка для Claude Code: точні типи полів, наявність доменів (coded values) для `ev_type`, а також `capabilities`/`editFieldsInfo` слід зчитати динамічно запитом до `{FeatureServer_URL}/0?f=json` під час розробки (доступ до сервісу закритий firewall'ом Enterprise ззовні, тому на етапі написання специфікації недоступний). Атрибутивну форму (`FeatureForm`) будувати на основі `fields`/`domains` з відповіді сервісу, а не хардкодити два поля вручну — найближчим часом додадуться ще шари з іншою схемою, форма має бути генеричною.

**Наразі в роботі лише один шар** — `Evidence_for_sketch_map`. Інші шари для створення об'єктів додадуться пізніше; архітектура `LayerPanel`/`EditorPanel` має закладати можливість декількох редагованих шарів одночасно (перемикання активного шару, а не хардкод одного).

## 3. Технологічний стек

| Шар | Вибір | Причина |
|---|---|---|
| Картографічний рушій | **ArcGIS Maps SDK for JavaScript (4.x, ES modules)** | Enterprise-сумісність, вбудовані Legend/Sketch/Editor, репроєкція в UTM "з коробки", `view.takeScreenshot()` для швидкого клієнтського експорту замість повільного Portal Print Service |
| UI-компоненти | **Calcite Design System** (`@esri/calcite-components` + `@esri/calcite-components-react`) | Візуально консистентний з вбудованими Esri-віджетами, легкий (Web Components), готова темна/світла тема |
| Фреймворк | **React 18 + TypeScript + Vite** | Швидка збірка, code-splitting з коробки, малий стартовий бандл |
| Стан | **Zustand** | Легший за Redux, достатній для цього обсягу стану, без boilerplate |
| Drag & Drop (Layout) | **interact.js** або власний легкий drag-хендлер на pointer events | Позиціонування легенди/таблиці без важких D&D-фреймворків |
| Растеризація фінального макета | `view.takeScreenshot()` (растр карти) + композиція з DOM-елементами Layout через `dom-to-image` або ручний canvas-композинг | Уникнути Portal Print Service (повільний), увесь рендер — на клієнті |
| Хостинг | GitHub Pages | Вже вирішено користувачем |

**Явно НЕ використовувати:** ArcGIS Experience Builder, Web AppBuilder, серверний Print Service Job — усе це або вимагає адмін-прав, або повільне.

## 4. Архітектура застосунку

### 4.1 Принцип "один MapView"

Критично для швидкодії: **`MapView` створюється один раз і залишається змонтованим** протягом усієї сесії користувача. Перемикання вкладок Map ⇄ Layout **не пересоздає** WebGL-контекст і не перезавантажує карту — воно лише:
- показує/ховає UI-панелі навколо контейнера карти (абсолютне позиціювання поверх спільного `<div id="mapViewContainer">`);
- вмикає/вимикає інтерактивні режими (sketch-редагування активне лише в Map-режимі);
- застосовує/знімає параметри друку (масштаб, spatialReference, видимість елементів легенди) лише в Layout-режимі.

### 4.2 Дерево компонентів (орієнтовне)

```
App (Calcite Shell + calcite-shell-panel)
 ├─ AuthGate                      — обгортка, блокує рендер до завершення OAuth2-логіну
 │   └─ useAuth() (Zustand slice) — credential, user info, isEditingAllowed
 ├─ MapContainer                  — єдиний <MapView>, монтується один раз
 │   ├─ WebMap (item id з конфігу)
 │   └─ shared refs: view, activeLayers
 ├─ TabSwitcher (calcite-tabs: "Map" | "Layout")
 ├─ MapModeUI                     (видимий лише у вкладці Map)
 │   ├─ LayerPanel (EDITOR: Layer list, Symbology list)
 │   ├─ ObjectFilterDropdown
 │   ├─ SketchToolbar (Create / Delete — дизейблені за capabilities)
 │   └─ AttributeForm (FeatureForm під час редагування атрибутів)
 └─ LayoutModeUI                  (lazy-loaded, видимий лише у вкладці Layout, показ поверх MapContainer)
     ├─ ObjectFilterDropdown (той самий стан, що й у Map)
     ├─ OrientationSelector (portrait/landscape)
     ├─ BasemapSelector
     ├─ ScaleSelector (1:100, 1:200, 1:500, 1:1000, ...)
     ├─ SpatialReferenceSelector (UTM 35N / 36N / 37N)
     ├─ A4LayoutFrame              — DOM-рамка фіксованих пропорцій А4
     │   ├─ MapFrameOverlay        — прозоре вікно, крізь яке видно MapContainer знизу
     │   ├─ DraggableLegend        — обгортка з drag, всередині <arcgis-legend>
     │   └─ DraggableTextTable     — динамічний текст (дата, автор, назва об'єкта тощо)
     ├─ MapScaleSelector (дубль знизу за макетом — той самий стан)
     └─ ExportButton               — запускає takeScreenshot + композицію → PNG
```

### 4.3 Стан (Zustand, орієнтовні slices)

```ts
interface AppState {
  // auth
  credential: IdentityManagerCredential | null;
  userFullName: string | null;

  // map/editor
  activeMode: "map" | "layout";
  objectFilter: FilterExpression | null;
  editableLayers: Record<string, { capabilities: string[] }>; // з capabilities шару

  // layout
  orientation: "portrait" | "landscape";
  scale: 100 | 200 | 500 | 1000 | number;
  spatialReference: 32635 | 32636 | 32637; // UTM 35N/36N/37N WGS84
  basemapId: string;
  legendPosition: { x: number; y: number };
  textTableContent: Record<string, string>;
  textTablePosition: { x: number; y: number };
}
```

## 5. Автентифікація (OAuth2 + SSO)

1. `esri/identity/OAuthInfo`:
   ```ts
   const info = new OAuthInfo({
     appId: "I2nM1oIsuu2NcMi9",
     portalUrl: "https://gis.htgoims.org/portal",
     popup: false, // редирект у тому ж вікні; альтернатива popup: true — оцінити разом з поведінкою GH Pages
     flowType: "auto",
   });
   IdentityManager.registerOAuthInfos([info]);
   ```
2. При вході: `IdentityManager.getCredential(portalUrl + "/sharing")` — редиректить на сторінку логіну Portal (SSO підхопиться автоматично, якщо corporate IdP налаштований).
3. **Redirect URI в Application item на Portal має точно збігатись** з GitHub Pages URL, включно з наявністю/відсутністю кінцевого слеша — перевірити обидва варіанти (`https://<user>.github.io/<repo>/` і без слеша).
4. Після повернення — токен зберігається в `sessionStorage` (керується бібліотекою), автооновлення через silent refresh, поки жива сесія Portal.
5. `AuthGate` блокує рендер основного UI, доки `getCredential` не резолвиться.

## 6. Права на редагування (без власної системи ролей)

Після завантаження WebMap і feature layer:
```ts
const layerInfo = await fetch(`${featureServiceUrl}/0?f=json&token=${credential.token}`).then(r => r.json());
const canEdit = layerInfo.capabilities.includes("Create") ||
                layerInfo.capabilities.includes("Update") ||
                layerInfo.capabilities.includes("Delete");
```
- Якщо `canEdit === false` — кнопки Create/Delete в `EditorPanel` дизейблені (не приховані повністю — щоб було зрозуміло, що функціонал існує, але недоступний), з `calcite-tooltip`, що пояснює причину.
- Перевірка виконується для **кожного шару окремо**, якщо шарів декілька — деякі можуть бути редаговані, інші лише для перегляду.

## 7. Map-режим (редагування)

- `esri/widgets/Sketch` (або `Editor` widget, якщо потрібна вбудована атрибутивна форма з коробки) для геометрії.
- `esri/widgets/FeatureForm` для редагування атрибутів — поля/домени зчитуються з `fields`/`domains` шару автоматично, не хардкодити форму вручну.
- `ObjectFilterDropdown` — фільтр через `layer.definitionExpression`, впливає на видимі об'єкти і в Map, і в Layout (спільний стан).

## 8. Layout-режим (компонування для друку)

### 8.1 A4 Frame
- Фіксований контейнер з `aspect-ratio`, що перемикається portrait (210×297) / landscape (297×210).
- Масштаб екранного відображення контейнера — довільний (fit to panel), **реальний картографічний масштаб виставляється окремо** через `view.scale = selectedScale` (Esri сам рахує коректний extent).

### 8.2 Масштаб
- Dropdown з типовими значеннями: 1:100, 1:200, 1:500, 1:1000 (розширюваний список у конфізі, не хардкодити в UI-компоненті).
- `view.scale` виставляється напряму — ArcGIS сам перераховує bounds під поточну `spatialReference`.

### 8.3 Система координат
- Dropdown з трьома UTM-зонами (WGS84):
  - UTM 35N — EPSG:32635
  - UTM 36N — EPSG:32636
  - UTM 37N — EPSG:32637
- Перемикання `spatialReference` можливе або (а) зміною `view.spatialReference` напряму (простіше, але ререндерить базову карту — перевірити продуктивність), або (б) лишити базову карту в 3857 і малювати лише координатну сітку/градуси в обраній UTM через `esri/geometry/projection` (`projection.project()`), що швидше й не вимагає репроєкції тайлів. **Рекомендація: варіант (б)** для збереження швидкодії, якщо тестування варіанту (а) покаже гальмування при зміні зони.

### 8.4 Легенда
- `<arcgis-legend>` (Calcite/Esri веб-компонент) всередині власного draggable-контейнера.
- Позиція зберігається в Zustand (`legendPosition`), рамка обмежена межами A4-фрейму (snap до країв — опційно, друга ітерація).

### 8.5 Динамічна текстова таблиця
- Прості текстові поля (дата, автор, назва об'єкта, координати центру тощо), значення можуть підтягуватись автоматично (дата — `new Date()`, координати — з поточного `view.center`, перепроєктованого в обрану UTM) або вводитись вручну.

### 8.6 Basemap selector
- Перелік базових карт з Portal (`esri/widgets/BasemapGallery` дані, або власний dropdown над `portal.basemaps`).

## 9. Експорт

**Формат на першому етапі: тільки JPG.** PDF/PNG — можливе розширення пізніше, коли основний функціонал запрацює; не закладати зараз зайву абстракцію під множинні формати, щоб не ускладнювати MVP.

1. `const screenshot = await view.takeScreenshot({ width: pxWidth, height: pxHeight, format: "jpg", quality: 90 })`, де `pxWidth/pxHeight` рахуються з розміру A4 (мм) і обраного DPI (напр. 200–300 DPI):
   ```
   px = mm / 25.4 * dpi
   ```
2. Растр карти композиться з DOM-елементами Layout (легенда, таблиця, рамка) — через `dom-to-image`/canvas-композинг у фінальний `<canvas>`.
3. Максимальний DPI варто обмежити в конфізі й протестувати на слабших пристроях — `takeScreenshot` залежить від максимального розміру WebGL-текстури.
4. Кінцевий файл — `<canvas>.toBlob(..., "image/jpeg", 0.9)` → завантаження через `<a download="map.jpg">`, без бекенду (сумісно з GitHub Pages).

## 10. Продуктивність / lazy loading

- Стартовий бандл: тільки `AuthGate`, `MapContainer`, `TabSwitcher`, базові Calcite Shell-компоненти.
- `LayoutModeUI` і все, що з нею пов'язане (drag-логіка, Legend widget ініціалізація, export-модуль) — `React.lazy()` + `Suspense`, підвантажується при першому переході у вкладку Layout.
- Імпортувати Esri-модулі точково (`import MapView from "@arcgis/core/views/MapView.js"`), не через `esri-loader`/global bundle — щоб Vite міг tree-shake невикористане (SceneView, 3D тощо не мають потрапити в бандл).

## 11. Структура репозиторію (орієнтовна)

```
/src
  /app
    App.tsx
    AuthGate.tsx
  /map
    MapContainer.tsx
    useMapView.ts        (створення/збереження єдиного view в ref/context)
  /editor
    LayerPanel.tsx
    SketchToolbar.tsx
    AttributeForm.tsx
  /layout
    LayoutModeUI.tsx
    A4LayoutFrame.tsx
    OrientationSelector.tsx
    ScaleSelector.tsx
    SpatialReferenceSelector.tsx
    DraggableLegend.tsx
    DraggableTextTable.tsx
    exportEngine.ts       (takeScreenshot + композинг)
  /auth
    oauth.ts
  /store
    useAppStore.ts         (Zustand)
  /config
    env.ts                 (portalUrl, clientId, webmapId, featureServiceUrl, scaleOptions, utmZones)
/public
/index.html
vite.config.ts
```

## 12. Конфігураційний файл (env/config, не хардкодити в коді)

```ts
export const config = {
  portalUrl: "https://gis.htgoims.org/portal",
  clientId: "I2nM1oIsuu2NcMi9",
  webmapId: "942c8a52de5e445c932aaa94295afbaf",
  featureServiceUrl: "https://gis.htgoims.org/server/rest/services/Hosted/Evidence_for_sketch_map/FeatureServer",
  scaleOptions: [100, 200, 500, 1000],
  utmZones: [
    { label: "UTM 35N (WGS84)", wkid: 32635 },
    { label: "UTM 36N (WGS84)", wkid: 32636 },
    { label: "UTM 37N (WGS84)", wkid: 32637 },
  ],
  paperSize: { widthMm: 210, heightMm: 297 }, // A4, свап при landscape
  defaultDpi: 200,
};
```

## 13. Фази розробки (пропоновані)

1. **Foundation** — Vite+React+TS каркас, Calcite Shell, OAuth2-логін проти Portal, підтвердження, що redirect URI на GH Pages коректно спрацьовує.
2. **Map-режим** — єдиний MapView, WebMap завантажується, LayerPanel, перевірка `capabilities`, Sketch + FeatureForm редагування об'єктів.
3. **Layout-каркас** — TabSwitcher без перезавантаження карти, A4Frame з orientation/scale/UTM-перемиканням (без ще export/drag).
4. **Layout-елементи** — Legend widget у draggable-обгортці, динамічна текстова таблиця, basemap selector.
5. **Export engine** — takeScreenshot + композинг у PNG, тестування DPI/розмірів на реальних пристроях.
6. **Полірування** — snap-до-країв для drag-елементів, обробка помилок автентифікації/мережі, адаптивність для менших екранів (за потреби).

---

**Відкриті питання для уточнення під час розробки (не для цього документа, а для перевірки на живому середовищі):**
- Реальна схема полів і символіки `Evidence_for_sketch_map` (типи геометрії, домени атрибутів).
- Чи потрібен PDF-експорт окрім PNG (впливає на вибір бібліотеки композингу).
- Максимальна кількість шарів у WebMap і чи всі вони мають бути редаговані, чи лише один evidence-шар.
