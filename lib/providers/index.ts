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

/** Shared validation helper used by all providers */
export async function validateProviderKey(
  provider: string,
  apiKey: string,
  model: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider,
        apiKey,
        body: {
          model,
          messages: [{ role: "user", content: "Hi" }],
          max_tokens: 16,
        },
      }),
    });

    if (res.ok) return { valid: true };

    const data = await res.json().catch(() => null);

    // 401 = upstream auth failure → key is definitely bad
    if (res.status === 401) {
      return { valid: false, error: "Invalid API key. Please check and try again." };
    }

    // 403 = session expired, not an API key problem
    if (res.status === 403) {
      return { valid: false, error: data?.error || "Session expired. Please refresh the page and sign in." };
    }

    // 502 / other = upstream issue (model not found, rate limit, etc.)
    // The key itself is likely fine — accept it and let the user proceed
    return { valid: true, error: data?.error };
  } catch {
    return { valid: false, error: "Network error. Please check your connection." };
  }
}
