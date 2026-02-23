"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SelectedModelChip } from "./selected-model-chip";
import { ApiKeyDialog } from "./api-key-dialog";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { providers } from "@/lib/providers";
import { modelRegistry, type RegisteredModel } from "@/lib/providers/model-registry";
import { cn } from "@/lib/utils";

export function ModelPicker() {
  const [query, setQuery] = useState("");
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const {
    selectedModels,
    removeSelectedModel,
    isProviderAuthenticated,
  } = useApiKeysStore();

  // Build selected model info for chips
  const selectedModelInfo = useMemo(() => {
    return selectedModels.map((sm) => {
      const model = modelRegistry.find(
        (m) => m.providerId === sm.providerId && m.modelId === sm.modelId
      );
      return model ? { ...sm, model } : null;
    }).filter(Boolean) as Array<{ providerId: string; modelId: string; model: RegisteredModel }>;
  }, [selectedModels]);

  // Count selected models per provider
  const modelCountByProvider = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sm of selectedModels) {
      counts[sm.providerId] = (counts[sm.providerId] || 0) + 1;
    }
    return counts;
  }, [selectedModels]);

  // Filter providers by search query
  const filteredProviders = useMemo(() => {
    if (!query.trim()) return providers;
    const q = query.toLowerCase();
    return providers.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Selected models bar */}
      {selectedModelInfo.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedModelInfo.map(({ providerId, modelId, model }) => (
            <SelectedModelChip
              key={`${providerId}:${modelId}`}
              providerColor={model.providerColor}
              modelName={model.modelName}
              providerName={model.providerName}
              onRemove={() => removeSelectedModel(providerId, modelId)}
            />
          ))}
        </div>
      )}

      {/* Minimum indicator */}
      {selectedModels.length < 2 && (
        <p className="text-sm text-amber-400/80">
          Select at least {2 - selectedModels.length} more model{2 - selectedModels.length !== 1 ? "s" : ""} to start
        </p>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search providers..."
          className="pl-9"
        />
      </div>

      {/* Provider grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {filteredProviders.map((provider) => {
          const isConnected = isProviderAuthenticated(provider.id);
          const selectedCount = modelCountByProvider[provider.id] || 0;

          return (
            <button
              key={provider.id}
              onClick={() => setActiveProvider(provider.id)}
              className={cn(
                "relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all cursor-pointer",
                isConnected
                  ? "border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07]"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1]"
              )}
            >
              {/* Color accent stripe */}
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                style={{ backgroundColor: provider.color }}
              />

              {/* Provider name + dot */}
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: provider.color }}
                />
                <span className="text-sm font-semibold truncate">{provider.name}</span>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Connected
                  </span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Not connected</span>
                )}
              </div>

              {/* Model count */}
              <span className="text-[11px] text-muted-foreground">
                {provider.models.length} models available
                {selectedCount > 0 && (
                  <span className="text-indigo-400"> &middot; {selectedCount} selected</span>
                )}
              </span>
            </button>
          );
        })}

        {filteredProviders.length === 0 && (
          <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
            No providers found for &ldquo;{query}&rdquo;
          </div>
        )}
      </div>

      {/* Provider Setup / Model Selection Dialog */}
      {activeProvider && (
        <ApiKeyDialog
          providerId={activeProvider}
          open={!!activeProvider}
          onOpenChange={(open) => !open && setActiveProvider(null)}
          onDone={() => setActiveProvider(null)}
        />
      )}
    </div>
  );
}
