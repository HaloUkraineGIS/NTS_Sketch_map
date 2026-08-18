import { useAppStore } from "@/store/useAppStore";
import { config } from "@/config/env";

/**
 * UI-панелі, видимі лише у вкладці "Map".
 *
 * TODO(Claude Code), Фаза 2 (SPEC.md п.11 "Фази розробки"):
 * - LayerPanel: список шарів (наразі один — Evidence for sketch map) + символіка.
 * - ObjectFilterDropdown: керує layer.definitionExpression (спільний стан з Layout).
 * - SketchToolbar: esri/widgets/Sketch, кнопки Create/Delete дизейблені,
 *   якщо layerRuntimeInfo[layerId].canEdit === false (див. useAppStore).
 * - AttributeForm: esri/widgets/FeatureForm, поля будувати динамічно з fields/domains
 *   шару (наразі: name, ev_type — але не хардкодити, бо додадуться інші шари).
 */
export function MapModeUI() {
  const layerRuntimeInfo = useAppStore((s) => s.layerRuntimeInfo);
  const activeLayerId = useAppStore((s) => s.activeLayerId);
  const activeLayerConfig = config.editableLayers.find((l) => l.id === activeLayerId);
  const canEdit = activeLayerId ? layerRuntimeInfo[activeLayerId]?.canEdit : undefined;

  return (
    <calcite-shell-panel slot="panel-start" position="start" style={{ width: "320px" }}>
      <calcite-panel heading="EDITOR">
        <calcite-notice open kind={canEdit ? "success" : "warning"} icon>
          <div slot="message">
            {activeLayerConfig?.label ?? "Шар не обрано"} —{" "}
            {canEdit === undefined
              ? "перевірка прав..."
              : canEdit
                ? "редагування дозволено"
                : "лише перегляд (немає прав на редагування)"}
          </div>
        </calcite-notice>

        {/* TODO: Layer list / Symbology list */}
        <calcite-list label="Layer list" />

        <div slot="footer-actions" style={{ display: "flex", gap: "8px", padding: "8px" }}>
          <calcite-button disabled={!canEdit} appearance="solid" kind="brand">
            Create
          </calcite-button>
          <calcite-button disabled={!canEdit} appearance="outline" kind="danger">
            Delete
          </calcite-button>
        </div>
      </calcite-panel>
    </calcite-shell-panel>
  );
}
