import type { ProviderConfig } from "./index";

export const mistralProvider: ProviderConfig = {
  id: "mistral",
  name: "Mistral AI",
  color: "#ff7000",
  apiKeyPlaceholder: "Enter Mistral API key...",
  setupUrl: "https://console.mistral.ai/api-keys",
  setupInstructions: "1. Sign in at console.mistral.ai\n2. Go to API Keys\n3. Click 'Create new key'\n4. Copy and paste below",
  models: [
    { id: "mistral-large-latest", name: "Mistral Large", capability: 8, inputCostPer1M: 2, outputCostPer1M: 6, category: "flagship", contextWindow: 128000, tags: ["code", "reasoning"] },
    { id: "mistral-large-2411", name: "Mistral Large 2", capability: 9, inputCostPer1M: 2, outputCostPer1M: 6, category: "flagship", contextWindow: 128000, tags: ["code", "reasoning"] },
    { id: "pixtral-large-latest", name: "Pixtral Large", capability: 8, inputCostPer1M: 2, outputCostPer1M: 6, category: "flagship", contextWindow: 128000, tags: ["vision", "code"] },
    { id: "mistral-medium-latest", name: "Mistral Medium", capability: 7, inputCostPer1M: 2.7, outputCostPer1M: 8.1, category: "mid", contextWindow: 32000, tags: [] },
    { id: "mistral-small-latest", name: "Mistral Small", capability: 6, inputCostPer1M: 0.2, outputCostPer1M: 0.6, category: "budget", contextWindow: 32000, tags: ["speed"] },
    { id: "codestral-latest", name: "Codestral", capability: 8, inputCostPer1M: 0.3, outputCostPer1M: 0.9, category: "mid", contextWindow: 256000, tags: ["code"] },
    { id: "open-mistral-nemo", name: "Mistral Nemo", capability: 6, inputCostPer1M: 0.15, outputCostPer1M: 0.15, category: "budget", contextWindow: 128000, tags: ["speed"] },
    { id: "open-mixtral-8x22b", name: "Mixtral 8x22B", capability: 7, inputCostPer1M: 2, outputCostPer1M: 6, category: "mid", contextWindow: 65000, tags: ["code"] },
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
