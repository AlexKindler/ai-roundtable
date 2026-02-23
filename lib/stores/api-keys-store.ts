"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { encryptApiKey, decryptApiKey } from "@/lib/crypto";

export type KeyStatus = "idle" | "validating" | "valid" | "invalid";

export interface ProviderKeyState {
  apiKey: string;
  selectedModel: string;
  status: KeyStatus;
}

interface ApiKeysState {
  keys: Record<string, ProviderKeyState>;
  syncing: boolean;
  setApiKey: (providerId: string, apiKey: string) => void;
  setSelectedModel: (providerId: string, modelId: string) => void;
  setKeyStatus: (providerId: string, status: KeyStatus) => void;
  getActiveProviders: () => string[];
  hasMinimumProviders: () => boolean;
  syncToServer: (userId: string) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
  deleteKeyFromServer: (providerId: string) => Promise<void>;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      keys: {},
      syncing: false,

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

      syncToServer: async (userId: string) => {
        const { keys } = get();
        set({ syncing: true });

        try {
          const encryptedKeys = await Promise.all(
            Object.entries(keys)
              .filter(([, v]) => v.apiKey)
              .map(async ([providerId, v]) => {
                const { encrypted, iv } = await encryptApiKey(v.apiKey, userId);
                return {
                  providerId,
                  encryptedKey: encrypted,
                  iv,
                  selectedModel: v.selectedModel || undefined,
                };
              })
          );

          await fetch("/api/keys", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keys: encryptedKeys }),
          });
        } finally {
          set({ syncing: false });
        }
      },

      loadFromServer: async (userId: string) => {
        set({ syncing: true });

        try {
          const res = await fetch("/api/keys");
          if (!res.ok) return;

          const { keys: serverKeys } = await res.json();

          if (!Array.isArray(serverKeys) || serverKeys.length === 0) return;

          const decryptedKeys: Record<string, ProviderKeyState> = {};

          for (const sk of serverKeys) {
            try {
              const apiKey = await decryptApiKey(sk.encryptedKey, sk.iv, userId);
              decryptedKeys[sk.providerId] = {
                apiKey,
                selectedModel: sk.selectedModel || "",
                status: "idle",
              };
            } catch {
              // Skip keys that fail to decrypt
            }
          }

          // Merge: server keys fill in any missing local keys
          const currentKeys = get().keys;
          const merged = { ...decryptedKeys };
          for (const [id, local] of Object.entries(currentKeys)) {
            if (local.apiKey) {
              merged[id] = local;
            }
          }

          set({ keys: merged });
        } finally {
          set({ syncing: false });
        }
      },

      deleteKeyFromServer: async (providerId: string) => {
        await fetch(`/api/keys/${encodeURIComponent(providerId)}`, {
          method: "DELETE",
        });
      },
    }),
    {
      name: "ai-roundtable-keys",
    }
  )
);
