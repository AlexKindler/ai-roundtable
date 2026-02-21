"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DeliberationMode = "standard" | "quick" | "debate";
export type DefaultView = "final-only" | "all-rounds";

interface ModelSettings {
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface SettingsState {
  // Deliberation settings
  deliberationRounds: 2 | 3;
  deliberationMode: DeliberationMode;
  synthesizerModel: string; // "auto" or specific providerId:modelId

  // Display settings
  defaultView: DefaultView;
  showTokenCounts: boolean;
  showCostEstimates: boolean;

  // Per-model settings
  modelSettings: Record<string, ModelSettings>;

  // Actions
  setDeliberationRounds: (rounds: 2 | 3) => void;
  setDeliberationMode: (mode: DeliberationMode) => void;
  setSynthesizerModel: (model: string) => void;
  setDefaultView: (view: DefaultView) => void;
  setShowTokenCounts: (show: boolean) => void;
  setShowCostEstimates: (show: boolean) => void;
  getModelSettings: (providerId: string) => ModelSettings;
  setModelSettings: (providerId: string, settings: Partial<ModelSettings>) => void;
}

const defaultModelSettings: ModelSettings = {
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "",
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      deliberationRounds: 3,
      deliberationMode: "standard",
      synthesizerModel: "auto",
      defaultView: "final-only",
      showTokenCounts: true,
      showCostEstimates: true,
      modelSettings: {},

      setDeliberationRounds: (rounds) => set({ deliberationRounds: rounds }),
      setDeliberationMode: (mode) => set({ deliberationMode: mode }),
      setSynthesizerModel: (model) => set({ synthesizerModel: model }),
      setDefaultView: (view) => set({ defaultView: view }),
      setShowTokenCounts: (show) => set({ showTokenCounts: show }),
      setShowCostEstimates: (show) => set({ showCostEstimates: show }),

      getModelSettings: (providerId) => {
        return get().modelSettings[providerId] || defaultModelSettings;
      },

      setModelSettings: (providerId, settings) =>
        set((state) => ({
          modelSettings: {
            ...state.modelSettings,
            [providerId]: {
              ...defaultModelSettings,
              ...state.modelSettings[providerId],
              ...settings,
            },
          },
        })),
    }),
    {
      name: "ai-roundtable-settings",
    }
  )
);
