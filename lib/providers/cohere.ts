import type { ProviderConfig } from "./index";

export const cohereProvider: ProviderConfig = {
  id: "cohere",
  name: "Cohere",
  color: "#d18ee2",
  apiKeyPlaceholder: "Enter Cohere API key...",
  setupUrl: "https://dashboard.cohere.com/api-keys",
  setupInstructions: "1. Sign in at dashboard.cohere.com\n2. Go to API Keys\n3. Click 'Create Trial Key' or use production key\n4. Copy and paste below",
  models: [
    { id: "command-a-03-2025", name: "Command A", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 256000, tags: ["code", "reasoning"] },
    { id: "command-r-plus", name: "Command R+", capability: 8, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 128000, tags: ["code"] },
    { id: "command-r-plus-08-2024", name: "Command R+ (Aug 2024)", capability: 8, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 128000, tags: ["code"] },
    { id: "command-r", name: "Command R", capability: 7, inputCostPer1M: 0.15, outputCostPer1M: 0.6, category: "mid", contextWindow: 128000, tags: [] },
    { id: "command-light", name: "Command Light", capability: 5, inputCostPer1M: 0.3, outputCostPer1M: 0.6, category: "budget", contextWindow: 4096, tags: ["speed"] },
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
