import { useEffect, useRef, useState } from "react";
import WebMap from "@arcgis/core/WebMap.js";
import MapView from "@arcgis/core/views/MapView.js";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer.js";
import { config } from "@/config/env";
import { useAppStore } from "@/store/useAppStore";

interface UseMapViewResult {
  containerRef: React.RefObject<HTMLDivElement>;
  view: MapView | null;
  isReady: boolean;
}

/**
 * Створює ОДИН MapView за весь життєвий цикл застосунку.
 * Компонент, що викликає цей hook, має монтуватись один раз
 * (напр. у кореневому MapContainer) і НЕ пересоздаватись при
 * перемиканні вкладок Map/Layout — це і є принцип "один MapView".
 */
export function useMapView(): UseMapViewResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<MapView | null>(null);
  const [isReady, setIsReady] = useState(false);
  const setLayerRuntimeInfo = useAppStore((s) => s.setLayerRuntimeInfo);
  const credential = useAppStore((s) => s.credential);

  useEffect(() => {
    if (!containerRef.current || viewRef.current || !credential) return;

    console.log("🔍 Завантажую MapView для:", credential.userId);
    console.log("📍 WebMap ID:", config.webmapId);
    console.log("🔗 Portal URL:", config.portalUrl);

    const webmap = new WebMap({
      portalItem: { 
        id: config.webmapId, 
        portal: { url: config.portalUrl } 
      },
    });

    const view = new MapView({
      container: containerRef.current,
      map: webmap,
    });

    viewRef.current = view;

    view.when(async () => {
      // Перевірка прав редагування для кожного налаштованого шару (п.6 SPEC.md).
      // TODO(Claude Code): якщо шар вже є частиною WebMap — брати капабіліті
      // з відповідного layer instance замість повторного створення FeatureLayer.
      await Promise.all(
        config.editableLayers.map(async (layerConfig) => {
          try {
            const layer = new FeatureLayer({ url: layerConfig.url });
            await layer.load();
            const capsString: string = (layer as any).capabilities?.operations
              ? Object.entries((layer as any).capabilities.operations)
                  .filter(([, v]) => v)
                  .map(([k]) => k)
                  .join(",")
              : "";
            const capabilities = capsString.split(",").filter(Boolean);
            const canEdit =
              capabilities.some((c) =>
                ["supportsAdd", "supportsUpdate", "supportsDelete"].includes(c)
              );

            console.log(`📌 Шар ${layerConfig.id}: canEdit=${canEdit}`);
            setLayerRuntimeInfo(layerConfig.id, { capabilities, canEdit });
          } catch (err) {
            console.error(`❌ Шар ${layerConfig.id}:`, err);
            setLayerRuntimeInfo(layerConfig.id, { capabilities: [], canEdit: false });
          }
        })
      );

      console.log("✅ MapView готовий");
      setIsReady(true);
    }).catch((err) => {
      console.error("❌ MapView error:", err);
    });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [credential, setLayerRuntimeInfo]);

  return { containerRef, view: viewRef.current, isReady };
}
