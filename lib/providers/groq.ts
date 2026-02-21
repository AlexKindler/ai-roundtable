import type { ProviderConfig } from "./index";

export const groqProvider: ProviderConfig = {
  id: "groq",
  name: "Meta Llama (Groq)",
  color: "#f55036",
  apiKeyPlaceholder: "gsk_...",
  apiKeyPrefix: "gsk_",
  models: [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", capability: 8, inputCostPer1M: 0.59, outputCostPer1M: 0.79 },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B", capability: 6, inputCostPer1M: 0.05, outputCostPer1M: 0.08 },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", capability: 7, inputCostPer1M: 0.24, outputCostPer1M: 0.24 },
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
      return res.ok;
    } catch {
      return false;
    }
  },
};
