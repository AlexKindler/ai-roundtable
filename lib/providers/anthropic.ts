import type { ProviderConfig } from "./index";

export const anthropicProvider: ProviderConfig = {
  id: "anthropic",
  name: "Anthropic",
  color: "#7c3aed",
  apiKeyPlaceholder: "sk-ant-...",
  apiKeyPrefix: "sk-ant-",
  models: [
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15 },
    { id: "claude-opus-4-0-20250514", name: "Claude Opus 4", capability: 10, inputCostPer1M: 15, outputCostPer1M: 75 },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", capability: 7, inputCostPer1M: 0.8, outputCostPer1M: 4 },
  ],
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "anthropic",
          apiKey,
          body: {
            model: "claude-3-5-haiku-20241022",
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
