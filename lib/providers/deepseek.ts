import type { ProviderConfig } from "./index";

export const deepseekProvider: ProviderConfig = {
  id: "deepseek",
  name: "DeepSeek",
  color: "#4D6BFE",
  apiKeyPlaceholder: "sk-...",
  models: [
    { id: "deepseek-chat", name: "DeepSeek Chat", capability: 8, inputCostPer1M: 0.14, outputCostPer1M: 0.28 },
    { id: "deepseek-reasoner", name: "DeepSeek Reasoner", capability: 9, inputCostPer1M: 0.55, outputCostPer1M: 2.19 },
  ],
  getBaseURL: () => "https://api.deepseek.com",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "deepseek",
          apiKey,
          body: {
            model: "deepseek-chat",
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
