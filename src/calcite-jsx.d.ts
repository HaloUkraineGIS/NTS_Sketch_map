// Calcite Components завантажуються глобально через CDN (index.html) як Custom Elements.
// Цей файл лише дозволяє TypeScript/JSX сприймати теги calcite-* без помилок типів.
//
// TODO(Claude Code): для строгішої типізації можна поступово замінити ці "сирі" теги
// на типізовані React-обгортки з @esri/calcite-components-react (CalcitePanel, CalciteButton...),
// які вже є в залежностях проекту. Для стартового каркаса залишено як є —
// цей файл дає гнучкість почати з мінімумом тертя.

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: `calcite-${string}`]: any;
  }
}
