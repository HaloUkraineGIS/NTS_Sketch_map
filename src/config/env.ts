// Центральний конфіг застосунку.
// Значення, специфічні для середовища (dev/prod), можна винести у .env
// через import.meta.env, якщо знадобиться відрізняти локальний Portal від прод.

export const config = {
  portalUrl: "https://gis.htgoims.org/portal",
  clientId: "I2nM1oIsuu2NcMi9",
  webmapId: "942c8a52de5e445c932aaa94295afbaf",

  // ВАЖЛИВО: значення нижче має БУКВАЛЬНО (символ-у-символ, включно з trailing
  // slash) збігатися з одним із Redirect URIs, зареєстрованих в Application
  // item на Portal. Не покладатись на window.location.href — саме ця
  // неявність і призводить до "Invalid redirect_uri Error: 400" на GitHub
  // Pages, де той самий сайт відкривається і зі слешем в кінці, і без нього.
  //
  // import.meta.env.DEV — true під час `npm run dev` (Vite), false у білді.
  redirectUri: import.meta.env.DEV
    ? "http://localhost:5173/"
    : "https://haloukrainegis.github.io/NTS_Sketch_map/",

  // Наразі в роботі лише один шар. Структура — масив,
  // щоб легко додавати наступні шари без переписування логіки.
  editableLayers: [
    {
      id: "evidence-for-sketch-map",
      url: "https://gis.htgoims.org/server/rest/services/Hosted/Evidence_for_sketch_map/FeatureServer/0",
      label: "Evidence for sketch map",
      // Геометрія: точка. Атрибути: name (текст), ev_type (категорія, ймовірно domain).
      // Повну схему (domains, editFieldsInfo, capabilities) зчитувати динамічно з сервісу
      // при завантаженні шару — не хардкодити тут.
    },
  ],

  scaleOptions: [100, 200, 500, 1000],

  utmZones: [
    { label: "UTM 35N (WGS84)", wkid: 32635 },
    { label: "UTM 36N (WGS84)", wkid: 32636 },
    { label: "UTM 37N (WGS84)", wkid: 32637 },
  ],

  paperSize: {
    widthMm: 210,
    heightMm: 297,
  },

  defaultDpi: 200,

  // Формат експорту наразі лише JPG (див. SPEC.md, п.9).
  exportFormat: "jpg" as const,
  exportQuality: 0.9,
};

export type UtmZone = (typeof config.utmZones)[number];
export type EditableLayerConfig = (typeof config.editableLayers)[number];
