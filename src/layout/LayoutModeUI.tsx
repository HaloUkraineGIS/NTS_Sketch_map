import { useAppStore } from "@/store/useAppStore";
import { config } from "@/config/env";

/**
 * UI-панелі, видимі лише у вкладці "Layout".
 *
 * TODO(Claude Code):
 * Фаза 3 (SPEC.md п.11) — каркас без export/drag:
 * - A4LayoutFrame: DOM-рамка фіксованих пропорцій A4, портрет/альбом (config.paperSize).
 * - OrientationSelector, ScaleSelector (config.scaleOptions), SpatialReferenceSelector
 *   (config.utmZones) — усі змінюють view.scale / spatialReference (SPEC.md п.8.2, 8.3).
 *
 * Фаза 4 — елементи:
 * - DraggableLegend: обгортка з drag (interact.js) навколо <arcgis-legend>,
 *   позиція зберігається в useAppStore.legendPosition.
 * - DraggableTextTable: динамічний текст, useAppStore.textTableContent.
 * - BasemapSelector.
 *
 * Фаза 5 — export:
 * - exportEngine.ts: view.takeScreenshot() + композинг у JPG (SPEC.md п.9).
 */
export function LayoutModeUI() {
  const orientation = useAppStore((s) => s.orientation);
  const setOrientation = useAppStore((s) => s.setOrientation);
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);
  const spatialReferenceWkid = useAppStore((s) => s.spatialReferenceWkid);
  const setSpatialReferenceWkid = useAppStore((s) => s.setSpatialReferenceWkid);

  return (
    <calcite-shell-panel slot="panel-end" position="end" style={{ width: "360px" }}>
      <calcite-panel heading="Layout">
        <calcite-label layout="inline">
          Orientation
          <calcite-select
            onCalciteSelectChange={(e: any) =>
              setOrientation(e.target.value as "portrait" | "landscape")
            }
          >
            <calcite-option value="portrait" selected={orientation === "portrait"}>
              Portrait
            </calcite-option>
            <calcite-option value="landscape" selected={orientation === "landscape"}>
              Landscape
            </calcite-option>
          </calcite-select>
        </calcite-label>

        <calcite-label layout="inline">
          Map Scale
          <calcite-select
            onCalciteSelectChange={(e: any) => setScale(Number(e.target.value))}
          >
            {config.scaleOptions.map((s) => (
              <calcite-option key={s} value={String(s)} selected={s === scale}>
                {`1:${s}`}
              </calcite-option>
            ))}
          </calcite-select>
        </calcite-label>

        <calcite-label layout="inline">
          Coordinate system (UTM)
          <calcite-select
            onCalciteSelectChange={(e: any) =>
              setSpatialReferenceWkid(Number(e.target.value))
            }
          >
            {config.utmZones.map((zone) => (
              <calcite-option
                key={zone.wkid}
                value={String(zone.wkid)}
                selected={zone.wkid === spatialReferenceWkid}
              >
                {zone.label}
              </calcite-option>
            ))}
          </calcite-select>
        </calcite-label>

        {/* TODO: A4LayoutFrame з DraggableLegend / DraggableTextTable всередині */}
        <div
          style={{
            border: "1px dashed var(--calcite-color-border-2)",
            aspectRatio:
              orientation === "portrait"
                ? `${config.paperSize.widthMm} / ${config.paperSize.heightMm}`
                : `${config.paperSize.heightMm} / ${config.paperSize.widthMm}`,
            margin: "12px",
            display: "grid",
            placeItems: "center",
            color: "var(--calcite-color-text-3)",
          }}
        >
          A4 layout frame (TODO)
        </div>

        <calcite-button slot="footer-actions" width="full" icon-start="export" disabled>
          Export JPG (TODO)
        </calcite-button>
      </calcite-panel>
    </calcite-shell-panel>
  );
}
