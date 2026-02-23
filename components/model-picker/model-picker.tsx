"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ModelCard } from "./model-card";
import { SelectedModelChip } from "./selected-model-chip";
import { ApiKeyDialog } from "./api-key-dialog";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { modelRegistry, searchModels, filterByCategory, type RegisteredModel } from "@/lib/providers/model-registry";
import type { ModelCategory } from "@/lib/providers";
import { cn } from "@/lib/utils";

const categories: { label: string; value: ModelCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Flagship", value: "flagship" },
  { label: "Mid", value: "mid" },
  { label: "Budget", value: "budget" },
  { label: "Reasoning", value: "reasoning" },
  { label: "Speed", value: "speed" },
];

export function ModelPicker() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ModelCategory | "all">("all");
  const [pendingAuth, setPendingAuth] = useState<{ providerId: string; modelId: string } | null>(null);

  const {
    selectedModels,
    providerAuth,
    addSelectedModel,
    removeSelectedModel,
    isModelSelected,
    isProviderAuthenticated,
  } = useApiKeysStore();

  const filteredModels = useMemo(() => {
    const searched = searchModels(query);
    return filterByCategory(searched, category);
  }, [query, category]);

  // Group by provider
  const groupedModels = useMemo(() => {
    const groups = new Map<string, RegisteredModel[]>();
    for (const model of filteredModels) {
      const existing = groups.get(model.providerId) || [];
      existing.push(model);
      groups.set(model.providerId, existing);
    }
    return groups;
  }, [filteredModels]);

  // Build selected model info for chips
  const selectedModelInfo = useMemo(() => {
    return selectedModels.map((sm) => {
      const model = modelRegistry.find(
        (m) => m.providerId === sm.providerId && m.modelId === sm.modelId
      );
      return model ? { ...sm, model } : null;
    }).filter(Boolean) as Array<{ providerId: string; modelId: string; model: RegisteredModel }>;
  }, [selectedModels]);

  const handleToggleModel = (model: RegisteredModel) => {
    const selected = isModelSelected(model.providerId, model.modelId);
    if (selected) {
      removeSelectedModel(model.providerId, model.modelId);
      return;
    }

    // Not selected — check auth
    if (!isProviderAuthenticated(model.providerId)) {
      setPendingAuth({ providerId: model.providerId, modelId: model.modelId });
      return;
    }

    addSelectedModel(model.providerId, model.modelId);
  };

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
          placeholder="Search models by name, provider, or tag..."
          className="pl-9"
        />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
              category === cat.value
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                : "bg-white/[0.04] text-muted-foreground hover:bg-white/[0.08] border border-transparent"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Model list grouped by provider */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {Array.from(groupedModels.entries()).map(([providerId, models]) => (
          <div key={providerId}>
            <div className="flex items-center gap-2 mb-2">
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: models[0].providerColor }}
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {models[0].providerName}
              </span>
              {isProviderAuthenticated(providerId) && (
                <span className="text-[10px] text-emerald-400">Connected</span>
              )}
            </div>
            <div className="space-y-1">
              {models.map((model) => (
                <ModelCard
                  key={`${model.providerId}:${model.modelId}`}
                  model={model}
                  isSelected={isModelSelected(model.providerId, model.modelId)}
                  isAuthenticated={isProviderAuthenticated(model.providerId)}
                  onToggle={() => handleToggleModel(model)}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredModels.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No models found for &quot;{query}&quot;
          </div>
        )}
      </div>

      {/* API Key Dialog */}
      {pendingAuth && (
        <ApiKeyDialog
          providerId={pendingAuth.providerId}
          modelId={pendingAuth.modelId}
          open={!!pendingAuth}
          onOpenChange={(open) => !open && setPendingAuth(null)}
          onSuccess={() => setPendingAuth(null)}
        />
      )}
    </div>
  );
}
