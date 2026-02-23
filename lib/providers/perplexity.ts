import type { ProviderConfig } from "./index";

export const perplexityProvider: ProviderConfig = {
  id: "perplexity",
  name: "Perplexity",
  color: "#20808d",
  apiKeyPlaceholder: "pplx-...",
  apiKeyPrefix: "pplx-",
  setupUrl: "https://www.perplexity.ai/settings/api",
  setupInstructions: "1. Sign in at perplexity.ai\n2. Go to Settings > API\n3. Click 'Generate' to create a new key\n4. Copy and paste below",
  models: [
    { id: "sonar-pro", name: "Sonar Pro", capability: 8, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["search", "reasoning"] },
    { id: "sonar-reasoning-pro", name: "Sonar Reasoning Pro", capability: 9, inputCostPer1M: 2, outputCostPer1M: 8, category: "reasoning", contextWindow: 128000, tags: ["search", "reasoning"] },
    { id: "sonar-reasoning", name: "Sonar Reasoning", capability: 7, inputCostPer1M: 1, outputCostPer1M: 5, category: "reasoning", contextWindow: 128000, tags: ["search", "reasoning"] },
    { id: "sonar", name: "Sonar", capability: 7, inputCostPer1M: 1, outputCostPer1M: 1, category: "mid", contextWindow: 128000, tags: ["search"] },
  ],
  getBaseURL: () => "https://api.perplexity.ai",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "perplexity",
          apiKey,
          body: {
            model: "sonar",
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
