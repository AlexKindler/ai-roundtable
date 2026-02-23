import type { ProviderConfig } from "./index";

export const openaiProvider: ProviderConfig = {
  id: "openai",
  name: "OpenAI",
  color: "#10a37f",
  apiKeyPlaceholder: "sk-...",
  apiKeyPrefix: "sk-",
  setupUrl: "https://platform.openai.com/api-keys",
  setupInstructions: "1. Sign in at platform.openai.com\n2. Go to API Keys\n3. Click 'Create new secret key'\n4. Copy and paste below",
  models: [
    { id: "gpt-4.1", name: "GPT-4.1", capability: 10, inputCostPer1M: 2, outputCostPer1M: 8, category: "flagship", contextWindow: 1047576, tags: ["code", "vision", "reasoning"] },
    { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", capability: 8, inputCostPer1M: 0.4, outputCostPer1M: 1.6, category: "mid", contextWindow: 1047576, tags: ["code", "vision"] },
    { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", capability: 6, inputCostPer1M: 0.1, outputCostPer1M: 0.4, category: "budget", contextWindow: 1047576, tags: ["speed"] },
    { id: "gpt-4o", name: "GPT-4o", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 128000, tags: ["vision", "code"] },
    { id: "gpt-4o-mini", name: "GPT-4o Mini", capability: 7, inputCostPer1M: 0.15, outputCostPer1M: 0.6, category: "budget", contextWindow: 128000, tags: ["speed"] },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo", capability: 8, inputCostPer1M: 10, outputCostPer1M: 30, category: "flagship", contextWindow: 128000, tags: ["vision"] },
    { id: "o4-mini", name: "o4-mini", capability: 9, inputCostPer1M: 1.1, outputCostPer1M: 4.4, category: "reasoning", contextWindow: 200000, tags: ["reasoning", "code"] },
    { id: "o3", name: "o3", capability: 10, inputCostPer1M: 10, outputCostPer1M: 40, category: "reasoning", contextWindow: 200000, tags: ["reasoning", "code", "math"] },
    { id: "o3-mini", name: "o3 Mini", capability: 8, inputCostPer1M: 1.1, outputCostPer1M: 4.4, category: "reasoning", contextWindow: 200000, tags: ["reasoning", "code"] },
    { id: "o1", name: "o1", capability: 10, inputCostPer1M: 15, outputCostPer1M: 60, category: "reasoning", contextWindow: 200000, tags: ["reasoning", "math"] },
    { id: "o1-mini", name: "o1 Mini", capability: 8, inputCostPer1M: 3, outputCostPer1M: 12, category: "reasoning", contextWindow: 128000, tags: ["reasoning"] },
  ],
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "openai",
          apiKey,
          body: {
            model: "gpt-4o-mini",
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
