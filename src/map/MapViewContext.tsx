import { createContext, useContext } from "react";
import type MapView from "@arcgis/core/views/MapView";

export const MapViewContext = createContext<MapView | null>(null);

/** Доступ до єдиного MapView з будь-якого дочірнього компонента (Editor, Layout). */
export function useMapViewContext(): MapView {
  const view = useContext(MapViewContext);
  if (!view) {
    throw new Error(
      "useMapViewContext викликано поза MapViewContext.Provider — MapView ще не готовий."
    );
  }
  return view;
}
