import { AuthGate } from "./AuthGate";
import { MapContainer } from "@/map/MapContainer";
import { useAppStore } from "@/store/useAppStore";
import type { AppMode } from "@/store/useAppStore";

export function App() {
  const activeMode = useAppStore((s) => s.activeMode);
  const setActiveMode = useAppStore((s) => s.setActiveMode);

  return (
    <calcite-shell content-behind style={{ height: "100vh" }}>
      <calcite-navigation slot="header">
        <calcite-navigation-logo slot="logo" heading="A4 Map Editor" />
        <calcite-tabs slot="content-end" layout="inline">
          <calcite-tab-nav slot="title-group">
            <calcite-tab-title
              selected={activeMode === "map"}
              onCalciteTabTitleClick={() => setActiveMode("map" as AppMode)}
            >
              Map
            </calcite-tab-title>
            <calcite-tab-title
              selected={activeMode === "layout"}
              onCalciteTabTitleClick={() => setActiveMode("layout" as AppMode)}
            >
              Layout
            </calcite-tab-title>
          </calcite-tab-nav>
        </calcite-tabs>
      </calcite-navigation>

      <AuthGate>
        <MapContainer />
      </AuthGate>
    </calcite-shell>
  );
}
