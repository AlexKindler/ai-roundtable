import type { ProviderConfig } from "./index";

export const cohereProvider: ProviderConfig = {
  id: "cohere",
  name: "Cohere",
  color: "#d18ee2",
  apiKeyPlaceholder: "Enter Cohere API key...",
  models: [
    { id: "command-r-plus", name: "Command R+", capability: 8, inputCostPer1M: 2.5, outputCostPer1M: 10 },
    { id: "command-r", name: "Command R", capability: 7, inputCostPer1M: 0.15, outputCostPer1M: 0.6 },
    { id: "command-light", name: "Command Light", capability: 5, inputCostPer1M: 0.3, outputCostPer1M: 0.6 },
  ],
  getBaseURL: () => "https://api.cohere.com/compatibility/v1",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "cohere",
          apiKey,
          body: {
            model: "command-r",
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
