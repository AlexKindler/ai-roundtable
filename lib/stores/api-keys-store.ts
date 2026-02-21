"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type KeyStatus = "idle" | "validating" | "valid" | "invalid";

export interface ProviderKeyState {
  apiKey: string;
  selectedModel: string;
  status: KeyStatus;
}

interface ApiKeysState {
  keys: Record<string, ProviderKeyState>;
  setApiKey: (providerId: string, apiKey: string) => void;
  setSelectedModel: (providerId: string, modelId: string) => void;
  setKeyStatus: (providerId: string, status: KeyStatus) => void;
  getActiveProviders: () => string[];
  hasMinimumProviders: () => boolean;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      keys: {},

      setApiKey: (providerId, apiKey) =>
        set((state) => ({
          keys: {
            ...state.keys,
            [providerId]: {
              ...state.keys[providerId],
              apiKey,
              status: apiKey ? "idle" : "idle",
              selectedModel: state.keys[providerId]?.selectedModel || "",
            },
          },
        })),

      setSelectedModel: (providerId, modelId) =>
        set((state) => ({
          keys: {
            ...state.keys,
            [providerId]: {
              ...state.keys[providerId],
              selectedModel: modelId,
              apiKey: state.keys[providerId]?.apiKey || "",
              status: state.keys[providerId]?.status || "idle",
            },
          },
        })),

      setKeyStatus: (providerId, status) =>
        set((state) => ({
          keys: {
            ...state.keys,
            [providerId]: {
              ...state.keys[providerId],
              status,
              apiKey: state.keys[providerId]?.apiKey || "",
              selectedModel: state.keys[providerId]?.selectedModel || "",
            },
          },
        })),

      getActiveProviders: () => {
        const { keys } = get();
        return Object.entries(keys)
          .filter(([, v]) => v.status === "valid" && v.apiKey)
          .map(([k]) => k);
      },

      hasMinimumProviders: () => {
        return get().getActiveProviders().length >= 2;
      },
    }),
    {
      name: "ai-roundtable-keys",
    }
  )
);
