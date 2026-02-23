export type ModelCategory = "flagship" | "mid" | "budget" | "reasoning" | "speed";

export interface ModelOption {
  id: string;
  name: string;
  capability: number; // 1-10, used to auto-select synthesizer
  inputCostPer1M: number; // USD per 1M input tokens
  outputCostPer1M: number; // USD per 1M output tokens
  category: ModelCategory;
  contextWindow: number; // e.g. 128000
  tags?: string[]; // e.g. ["vision", "code", "reasoning"]
}

export interface ProviderConfig {
  id: string;
  name: string;
  color: string;
  models: ModelOption[];
  apiKeyPlaceholder: string;
  apiKeyPrefix?: string;
  setupUrl: string;
  setupInstructions: string;
  validateKey: (apiKey: string) => Promise<{ valid: boolean; error?: string }>;
  getBaseURL?: () => string;
}

export interface ActiveModel {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
  apiKey: string;
  color: string;
  capability: number;
}

// Provider registry
import { openaiProvider } from "./openai";
import { anthropicProvider } from "./anthropic";
import { googleProvider } from "./google";
import { mistralProvider } from "./mistral";
import { groqProvider } from "./groq";
import { cohereProvider } from "./cohere";
import { perplexityProvider } from "./perplexity";
import { xaiProvider } from "./xai";
import { deepseekProvider } from "./deepseek";
import { openrouterProvider } from "./openrouter";

export const providers: ProviderConfig[] = [
  openaiProvider,
  anthropicProvider,
  googleProvider,
  mistralProvider,
  groqProvider,
  cohereProvider,
  perplexityProvider,
  xaiProvider,
  deepseekProvider,
  openrouterProvider,
];

export function getProvider(id: string): ProviderConfig | undefined {
  return providers.find((p) => p.id === id);
}
