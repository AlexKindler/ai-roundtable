import type { ProviderConfig } from "./index";

export const openrouterProvider: ProviderConfig = {
  id: "openrouter",
  name: "OpenRouter",
  color: "#6366f1",
  apiKeyPlaceholder: "sk-or-...",
  apiKeyPrefix: "sk-or-",
  models: [
    { id: "openai/gpt-4o", name: "GPT-4o (via OpenRouter)", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10 },
    { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4 (via OpenRouter)", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15 },
    { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash (via OpenRouter)", capability: 8, inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (via OpenRouter)", capability: 8, inputCostPer1M: 0.4, outputCostPer1M: 0.4 },
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via OpenRouter)", capability: 9, inputCostPer1M: 0.55, outputCostPer1M: 2.19 },
  ],
  getBaseURL: () => "https://openrouter.ai/api/v1",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openrouter",
          apiKey,
          body: {
            model: "openai/gpt-4o-mini",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5,
          },
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
