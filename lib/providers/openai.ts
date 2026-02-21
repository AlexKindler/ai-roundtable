import type { ProviderConfig } from "./index";

export const openaiProvider: ProviderConfig = {
  id: "openai",
  name: "OpenAI",
  color: "#10a37f",
  apiKeyPlaceholder: "sk-...",
  apiKeyPrefix: "sk-",
  models: [
    { id: "gpt-4o", name: "GPT-4o", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10 },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", capability: 7, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", capability: 8, inputCostPer1M: 10, outputCostPer1M: 30 },
    { id: "o1", name: "o1", capability: 10, inputCostPer1M: 15, outputCostPer1M: 60 },
    { id: "o1-mini", name: "o1 Mini", capability: 8, inputCostPer1M: 3, outputCostPer1M: 12 },
  ],
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          apiKey,
          body: {
            model: "gpt-4o-mini",
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
