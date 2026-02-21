import type { ProviderConfig } from "./index";

export const mistralProvider: ProviderConfig = {
  id: "mistral",
  name: "Mistral AI",
  color: "#ff7000",
  apiKeyPlaceholder: "Enter Mistral API key...",
  models: [
    { id: "mistral-large-latest", name: "Mistral Large", capability: 8, inputCostPer1M: 2, outputCostPer1M: 6 },
    { id: "mistral-medium-latest", name: "Mistral Medium", capability: 7, inputCostPer1M: 2.7, outputCostPer1M: 8.1 },
    { id: "mistral-small-latest", name: "Mistral Small", capability: 6, inputCostPer1M: 0.2, outputCostPer1M: 0.6 },
    { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", capability: 7, inputCostPer1M: 2, outputCostPer1M: 6 },
  ],
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "mistral",
          apiKey,
          body: {
            model: "mistral-small-latest",
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
