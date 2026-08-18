import { useMapView } from "./useMapView";
import { MapViewContext } from "./MapViewContext";
import { MapModeUI } from "@/editor/MapModeUI";
import { LayoutModeUILazy } from "@/layout/LayoutModeUILazy";
import { useAppStore } from "@/store/useAppStore";

/**
 * Кореневий контейнер карти. МОНТУЄТЬСЯ ОДИН РАЗ.
 * Map/Layout-режими рендеряться як overlay поверх цього самого div,
 * а не як окремі MapView-інстанси — див. SPEC.md п.4.1.
 */
export function MapContainer() {
  const { containerRef, view, isReady } = useMapView();
  const activeMode = useAppStore((s) => s.activeMode);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0 }}
        data-testid="map-view-container"
      />

      {isReady && view && (
        <MapViewContext.Provider value={view}>
          {/* Обидва UI-шари монтовані одночасно, перемикається лише видимість,
              щоб уникнути пересоздання Sketch/Legend віджетів при кожному кліку по вкладці. */}
          <div style={{ display: activeMode === "map" ? "contents" : "none" }}>
            <MapModeUI />
          </div>
          <div style={{ display: activeMode === "layout" ? "contents" : "none" }}>
            <LayoutModeUILazy />
          </div>
        </MapViewContext.Provider>
      )}

      {!isReady && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
          <calcite-loader label="Завантаження карти..." scale="l" />
        </div>
      )}
    </div>
  );
}
