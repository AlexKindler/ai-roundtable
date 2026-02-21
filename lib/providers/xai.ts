import type { ProviderConfig } from "./index";

export const xaiProvider: ProviderConfig = {
  id: "xai",
  name: "xAI (Grok)",
  color: "#a0a0a0",
  apiKeyPlaceholder: "xai-...",
  apiKeyPrefix: "xai-",
  models: [
    { id: "grok-2", name: "Grok 2", capability: 8, inputCostPer1M: 2, outputCostPer1M: 10 },
    { id: "grok-2-mini", name: "Grok 2 Mini", capability: 6, inputCostPer1M: 0.3, outputCostPer1M: 0.5 },
  ],
  getBaseURL: () => "https://api.x.ai/v1",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "xai",
          apiKey,
          body: {
            model: "grok-2-mini",
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
