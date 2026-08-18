import { create } from "zustand";
import type Credential from "@arcgis/core/identity/Credential";
import { config } from "@/config/env";

export type AppMode = "map" | "layout";
export type Orientation = "portrait" | "landscape";

interface LayerRuntimeInfo {
  /** capabilities, як їх повертає FeatureServer, напр. "Create,Update,Delete,Query" */
  capabilities: string[];
  canEdit: boolean;
}

interface AppState {
  // --- auth ---
  credential: Credential | null;
  userFullName: string | null;
  setCredential: (credential: Credential | null, userFullName?: string | null) => void;

  // --- mode ---
  activeMode: AppMode;
  setActiveMode: (mode: AppMode) => void;

  // --- editor / layers ---
  activeLayerId: string | null;
  setActiveLayerId: (id: string | null) => void;
  layerRuntimeInfo: Record<string, LayerRuntimeInfo>;
  setLayerRuntimeInfo: (layerId: string, info: LayerRuntimeInfo) => void;

  objectFilter: string | null; // definitionExpression
  setObjectFilter: (expr: string | null) => void;

  // --- layout ---
  orientation: Orientation;
  setOrientation: (o: Orientation) => void;

  scale: number;
  setScale: (scale: number) => void;

  spatialReferenceWkid: number;
  setSpatialReferenceWkid: (wkid: number) => void;

  basemapId: string | null;
  setBasemapId: (id: string | null) => void;

  legendPosition: { x: number; y: number };
  setLegendPosition: (pos: { x: number; y: number }) => void;

  textTableContent: Record<string, string>;
  setTextTableField: (key: string, value: string) => void;
  textTablePosition: { x: number; y: number };
  setTextTablePosition: (pos: { x: number; y: number }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  credential: null,
  userFullName: null,
  setCredential: (credential, userFullName = null) => set({ credential, userFullName }),

  activeMode: "map",
  setActiveMode: (mode) => set({ activeMode: mode }),

  activeLayerId: config.editableLayers[0]?.id ?? null,
  setActiveLayerId: (id) => set({ activeLayerId: id }),
  layerRuntimeInfo: {},
  setLayerRuntimeInfo: (layerId, info) =>
    set((state) => ({
      layerRuntimeInfo: { ...state.layerRuntimeInfo, [layerId]: info },
    })),

  objectFilter: null,
  setObjectFilter: (expr) => set({ objectFilter: expr }),

  orientation: "portrait",
  setOrientation: (o) => set({ orientation: o }),

  scale: config.scaleOptions[2] ?? 500,
  setScale: (scale) => set({ scale }),

  spatialReferenceWkid: config.utmZones[0].wkid,
  setSpatialReferenceWkid: (wkid) => set({ spatialReferenceWkid: wkid }),

  basemapId: null,
  setBasemapId: (id) => set({ basemapId: id }),

  legendPosition: { x: 0, y: 0 },
  setLegendPosition: (pos) => set({ legendPosition: pos }),

  textTableContent: {},
  setTextTableField: (key, value) =>
    set((state) => ({
      textTableContent: { ...state.textTableContent, [key]: value },
    })),
  textTablePosition: { x: 0, y: 40 },
  setTextTablePosition: (pos) => set({ textTablePosition: pos }),
}));
