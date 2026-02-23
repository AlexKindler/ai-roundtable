import type { ProviderConfig } from "./index";

export const deepseekProvider: ProviderConfig = {
  id: "deepseek",
  name: "DeepSeek",
  color: "#4D6BFE",
  apiKeyPlaceholder: "sk-...",
  setupUrl: "https://platform.deepseek.com/api_keys",
  setupInstructions: "1. Sign in at platform.deepseek.com\n2. Go to API Keys\n3. Click 'Create new API key'\n4. Copy and paste below",
  models: [
    { id: "deepseek-chat", name: "DeepSeek V3", capability: 8, inputCostPer1M: 0.14, outputCostPer1M: 0.28, category: "flagship", contextWindow: 128000, tags: ["code", "reasoning"] },
    { id: "deepseek-v3-0324", name: "DeepSeek V3 (Mar 2025)", capability: 9, inputCostPer1M: 0.14, outputCostPer1M: 0.28, category: "flagship", contextWindow: 128000, tags: ["code", "reasoning"] },
    { id: "deepseek-reasoner", name: "DeepSeek R1", capability: 9, inputCostPer1M: 0.55, outputCostPer1M: 2.19, category: "reasoning", contextWindow: 128000, tags: ["reasoning", "math", "code"] },
    { id: "deepseek-r1-0528", name: "DeepSeek R1 (May 2025)", capability: 10, inputCostPer1M: 0.55, outputCostPer1M: 2.19, category: "reasoning", contextWindow: 128000, tags: ["reasoning", "math", "code"] },
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
      if (res.ok) return { valid: true };
      if (res.status === 401) return { valid: false, error: "Invalid API key. Please check and try again." };
      const data = await res.json().catch(() => null);
      return { valid: false, error: data?.error || `Validation failed (${res.status})` };
    } catch {
      return { valid: false, error: "Network error. Please check your connection." };
    }
  },
};
