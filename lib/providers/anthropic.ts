import type { ProviderConfig } from "./index";

export const anthropicProvider: ProviderConfig = {
  id: "anthropic",
  name: "Anthropic",
  color: "#7c3aed",
  apiKeyPlaceholder: "sk-ant-...",
  apiKeyPrefix: "sk-ant-",
  setupUrl: "https://console.anthropic.com/settings/keys",
  setupInstructions: "1. Sign in at console.anthropic.com\n2. Go to Settings > API Keys\n3. Click 'Create Key'\n4. Copy and paste below",
  models: [
    { id: "claude-opus-4-0-20250514", name: "Claude Opus 4", capability: 10, inputCostPer1M: 15, outputCostPer1M: 75, category: "flagship", contextWindow: 200000, tags: ["reasoning", "code", "vision"] },
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision", "reasoning"] },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision"] },
    { id: "claude-3-opus-20240229", name: "Claude 3 Opus", capability: 9, inputCostPer1M: 15, outputCostPer1M: 75, category: "flagship", contextWindow: 200000, tags: ["reasoning", "vision"] },
    { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku", capability: 7, inputCostPer1M: 0.8, outputCostPer1M: 4, category: "speed", contextWindow: 200000, tags: ["speed", "code"] },
    { id: "claude-3-haiku-20240307", name: "Claude 3 Haiku", capability: 6, inputCostPer1M: 0.25, outputCostPer1M: 1.25, category: "budget", contextWindow: 200000, tags: ["speed"] },
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
