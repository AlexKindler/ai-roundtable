import type { ProviderConfig } from "./index";

export const groqProvider: ProviderConfig = {
  id: "groq",
  name: "Groq",
  color: "#f55036",
  apiKeyPlaceholder: "gsk_...",
  apiKeyPrefix: "gsk_",
  setupUrl: "https://console.groq.com/keys",
  setupInstructions: "1. Sign in at console.groq.com\n2. Go to API Keys\n3. Click 'Create API Key'\n4. Copy and paste below",
  models: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", capability: 8, inputCostPer1M: 0.59, outputCostPer1M: 0.79, category: "flagship", contextWindow: 128000, tags: ["code"] },
    { id: "llama-3.1-70b-versatile", name: "Llama 3.1 70B", capability: 8, inputCostPer1M: 0.59, outputCostPer1M: 0.79, category: "flagship", contextWindow: 128000, tags: ["code"] },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", capability: 6, inputCostPer1M: 0.05, outputCostPer1M: 0.08, category: "budget", contextWindow: 128000, tags: ["speed"] },
    { id: "llama-3.2-3b-preview", name: "Llama 3.2 3B", capability: 5, inputCostPer1M: 0.06, outputCostPer1M: 0.06, category: "budget", contextWindow: 128000, tags: ["speed"] },
    { id: "llama-3.2-1b-preview", name: "Llama 3.2 1B", capability: 4, inputCostPer1M: 0.04, outputCostPer1M: 0.04, category: "budget", contextWindow: 128000, tags: ["speed"] },
    { id: "gemma2-9b-it", name: "Gemma 2 9B", capability: 6, inputCostPer1M: 0.2, outputCostPer1M: 0.2, category: "budget", contextWindow: 8192, tags: ["speed"] },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", capability: 7, inputCostPer1M: 0.24, outputCostPer1M: 0.24, category: "mid", contextWindow: 32768, tags: ["code"] },
  ],
  getBaseURL: () => "https://api.groq.com/openai/v1",
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "groq",
          apiKey,
          body: {
            model: "llama-3.1-8b-instant",
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
