import { providers, type ModelCategory } from "./index";

export interface RegisteredModel {
  modelId: string;
  modelName: string;
  capability: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  category: ModelCategory;
  contextWindow: number;
  tags: string[];
  providerId: string;
  providerName: string;
  providerColor: string;
}

// Build flat model registry from all providers
function buildRegistry(): RegisteredModel[] {
  const registry: RegisteredModel[] = [];
  for (const provider of providers) {
    for (const model of provider.models) {
      registry.push({
        modelId: model.id,
        modelName: model.name,
        capability: model.capability,
        inputCostPer1M: model.inputCostPer1M,
        outputCostPer1M: model.outputCostPer1M,
        category: model.category,
        contextWindow: model.contextWindow,
        tags: model.tags || [],
        providerId: provider.id,
        providerName: provider.name,
        providerColor: provider.color,
      });
    }
  }
  return registry;
}

export const modelRegistry: RegisteredModel[] = buildRegistry();

// O(1) lookup map keyed by "providerId:modelId"
const modelMap = new Map<string, RegisteredModel>();
for (const m of modelRegistry) {
  modelMap.set(`${m.providerId}:${m.modelId}`, m);
}

export function getModelByKey(providerId: string, modelId: string): RegisteredModel | undefined {
  return modelMap.get(`${providerId}:${modelId}`);
}

export function searchModels(query: string): RegisteredModel[] {
  if (!query.trim()) return modelRegistry;

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return modelRegistry.filter((model) => {
    const searchable = [
      model.modelName,
      model.providerName,
      model.category,
      ...model.tags,
    ].join(" ").toLowerCase();

    return terms.every((term) => searchable.includes(term));
  });
}

export function filterByCategory(models: RegisteredModel[], category: ModelCategory | "all"): RegisteredModel[] {
  if (category === "all") return models;
  return models.filter((m) => m.category === category);
}
