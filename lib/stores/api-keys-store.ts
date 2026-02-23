"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { encryptApiKey, decryptApiKey } from "@/lib/crypto";

export type KeyStatus = "idle" | "validating" | "valid" | "invalid";

export interface ProviderAuthState {
  apiKey: string;
  status: KeyStatus;
}

export interface SelectedModel {
  providerId: string;
  modelId: string;
}

interface ApiKeysState {
  providerAuth: Record<string, ProviderAuthState>;
  selectedModels: SelectedModel[];
  syncing: boolean;

  // Provider auth actions
  setApiKey: (providerId: string, apiKey: string) => void;
  setKeyStatus: (providerId: string, status: KeyStatus) => void;
  getProviderAuth: (providerId: string) => ProviderAuthState | undefined;
  isProviderAuthenticated: (providerId: string) => boolean;

  // Model selection actions
  addSelectedModel: (providerId: string, modelId: string) => void;
  removeSelectedModel: (providerId: string, modelId: string) => void;
  isModelSelected: (providerId: string, modelId: string) => boolean;
  hasMinimumModels: () => boolean;
  getSelectedModels: () => SelectedModel[];

  // Backward compat
  getActiveProviders: () => string[];
  hasMinimumProviders: () => boolean;

  // Server sync
  syncToServer: (userId: string) => Promise<void>;
  loadFromServer: (userId: string) => Promise<void>;
  deleteKeyFromServer: (providerId: string) => Promise<void>;
}

// Migration from v1 (old shape) to v2 (new shape)
function migrateV1toV2(persisted: Record<string, unknown>): Record<string, unknown> {
  // v1 had: keys: Record<string, { apiKey, selectedModel, status }>
  const oldKeys = persisted.keys as Record<string, { apiKey: string; selectedModel: string; status: KeyStatus }> | undefined;
  if (!oldKeys) return persisted;

  const providerAuth: Record<string, ProviderAuthState> = {};
  const selectedModels: SelectedModel[] = [];

  for (const [providerId, v] of Object.entries(oldKeys)) {
    if (v.apiKey) {
      providerAuth[providerId] = {
        apiKey: v.apiKey,
        status: v.status || "idle",
      };
    }
    if (v.selectedModel && v.apiKey) {
      selectedModels.push({ providerId, modelId: v.selectedModel });
    }
  }

  return {
    ...persisted,
    providerAuth,
    selectedModels,
    keys: undefined,
  };
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set, get) => ({
      providerAuth: {},
      selectedModels: [],
      syncing: false,

      setApiKey: (providerId, apiKey) =>
        set((state) => ({
          providerAuth: {
            ...state.providerAuth,
            [providerId]: {
              ...state.providerAuth[providerId],
              apiKey,
              status: apiKey ? (state.providerAuth[providerId]?.status || "idle") : "idle",
            },
          },
        })),

      setKeyStatus: (providerId, status) =>
        set((state) => ({
          providerAuth: {
            ...state.providerAuth,
            [providerId]: {
              ...state.providerAuth[providerId],
              apiKey: state.providerAuth[providerId]?.apiKey || "",
              status,
            },
          },
        })),

      getProviderAuth: (providerId) => {
        return get().providerAuth[providerId];
      },

      isProviderAuthenticated: (providerId) => {
        const auth = get().providerAuth[providerId];
        return auth?.status === "valid" && !!auth.apiKey;
      },

      addSelectedModel: (providerId, modelId) =>
        set((state) => {
          const exists = state.selectedModels.some(
            (m) => m.providerId === providerId && m.modelId === modelId
          );
          if (exists) return state;
          return {
            selectedModels: [...state.selectedModels, { providerId, modelId }],
          };
        }),

      removeSelectedModel: (providerId, modelId) =>
        set((state) => ({
          selectedModels: state.selectedModels.filter(
            (m) => !(m.providerId === providerId && m.modelId === modelId)
          ),
        })),

      isModelSelected: (providerId, modelId) => {
        return get().selectedModels.some(
          (m) => m.providerId === providerId && m.modelId === modelId
        );
      },

      hasMinimumModels: () => {
        return get().selectedModels.length >= 2;
      },

      getSelectedModels: () => {
        return get().selectedModels;
      },

      // Backward compat
      getActiveProviders: () => {
        const { providerAuth } = get();
        return Object.entries(providerAuth)
          .filter(([, v]) => v.status === "valid" && v.apiKey)
          .map(([k]) => k);
      },

      hasMinimumProviders: () => {
        return get().hasMinimumModels();
      },

      syncToServer: async (userId: string) => {
        const { providerAuth, selectedModels } = get();
        set({ syncing: true });

        try {
          const encryptedKeys = await Promise.all(
            Object.entries(providerAuth)
              .filter(([, v]) => v.apiKey)
              .map(async ([providerId, v]) => {
                const { encrypted, iv } = await encryptApiKey(v.apiKey, userId);
                return {
                  providerId,
                  encryptedKey: encrypted,
                  iv,
                  selectedModels: JSON.stringify(
                    selectedModels.filter((m) => m.providerId === providerId).map((m) => m.modelId)
                  ),
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

          const decryptedAuth: Record<string, ProviderAuthState> = {};
          const serverSelectedModels: SelectedModel[] = [];

          for (const sk of serverKeys) {
            try {
              const apiKey = await decryptApiKey(sk.encryptedKey, sk.iv, userId);
              decryptedAuth[sk.providerId] = {
                apiKey,
                status: "idle",
              };
              // Parse selectedModels JSON if available
              if (sk.selectedModels) {
                try {
                  const modelIds = JSON.parse(sk.selectedModels) as string[];
                  for (const modelId of modelIds) {
                    serverSelectedModels.push({ providerId: sk.providerId, modelId });
                  }
                } catch {
                  // Fallback to old selectedModel field
                  if (sk.selectedModel) {
                    serverSelectedModels.push({ providerId: sk.providerId, modelId: sk.selectedModel });
                  }
                }
              } else if (sk.selectedModel) {
                serverSelectedModels.push({ providerId: sk.providerId, modelId: sk.selectedModel });
              }
            } catch {
              // Skip keys that fail to decrypt
            }
          }

          // Merge: local keys take priority
          const currentAuth = get().providerAuth;
          const currentSelected = get().selectedModels;
          const merged = { ...decryptedAuth };
          for (const [id, local] of Object.entries(currentAuth)) {
            if (local.apiKey) {
              merged[id] = local;
            }
          }

          // Merge selected models: keep local, add server ones that are new
          const mergedModels = [...currentSelected];
          for (const sm of serverSelectedModels) {
            const exists = mergedModels.some(
              (m) => m.providerId === sm.providerId && m.modelId === sm.modelId
            );
            if (!exists) {
              mergedModels.push(sm);
            }
          }

          set({ providerAuth: merged, selectedModels: mergedModels });
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
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return migrateV1toV2(persistedState as Record<string, unknown>) as unknown as ApiKeysState;
        }
        return persistedState as unknown as ApiKeysState;
      },
    }
  )
);
