import type { ProviderConfig } from "./index";

export const xaiProvider: ProviderConfig = {
  id: "xai",
  name: "xAI (Grok)",
  color: "#a0a0a0",
  apiKeyPlaceholder: "xai-...",
  apiKeyPrefix: "xai-",
  setupUrl: "https://console.x.ai/",
  setupInstructions: "1. Sign in at console.x.ai\n2. Go to API Keys section\n3. Click 'Create API Key'\n4. Copy and paste below",
  models: [
    { id: "grok-3", name: "Grok 3", capability: 10, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 131072, tags: ["reasoning", "code"] },
    { id: "grok-3-mini", name: "Grok 3 Mini", capability: 8, inputCostPer1M: 0.3, outputCostPer1M: 0.5, category: "reasoning", contextWindow: 131072, tags: ["reasoning", "speed"] },
    { id: "grok-2", name: "Grok 2", capability: 8, inputCostPer1M: 2, outputCostPer1M: 10, category: "flagship", contextWindow: 131072, tags: ["code"] },
    { id: "grok-2-vision", name: "Grok 2 Vision", capability: 8, inputCostPer1M: 2, outputCostPer1M: 10, category: "flagship", contextWindow: 32768, tags: ["vision"] },
    { id: "grok-2-mini", name: "Grok 2 Mini", capability: 6, inputCostPer1M: 0.3, outputCostPer1M: 0.5, category: "budget", contextWindow: 131072, tags: ["speed"] },
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
      if (res.ok) return { valid: true };
      if (res.status === 401) return { valid: false, error: "Invalid API key. Please check and try again." };
      const data = await res.json().catch(() => null);
      return { valid: false, error: data?.error || `Validation failed (${res.status})` };
    } catch {
      return { valid: false, error: "Network error. Please check your connection." };
    }
  },
};
