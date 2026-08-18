import { lazy, Suspense } from "react";

// Весь Layout-функціонал (drag&drop, Legend widget, export engine)
// підвантажується лише при першому вході у вкладку Layout — SPEC.md п.10.
const LayoutModeUI = lazy(() =>
  import("./LayoutModeUI").then((m) => ({ default: m.LayoutModeUI }))
);

export function LayoutModeUILazy() {
  return (
    <Suspense fallback={<calcite-loader label="Завантаження макета..." scale="m" />}>
      <LayoutModeUI />
    </Suspense>
  );
}
