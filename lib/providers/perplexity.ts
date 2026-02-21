import type { ProviderConfig } from "./index";

export const perplexityProvider: ProviderConfig = {
  id: "perplexity",
  name: "Perplexity",
  color: "#20808d",
  apiKeyPlaceholder: "pplx-...",
  apiKeyPrefix: "pplx-",
  models: [
    { id: "sonar-pro", name: "Sonar Pro", capability: 8, inputCostPer1M: 3, outputCostPer1M: 15 },
    { id: "sonar", name: "Sonar", capability: 7, inputCostPer1M: 1, outputCostPer1M: 1 },
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
