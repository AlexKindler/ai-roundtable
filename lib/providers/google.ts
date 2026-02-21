import type { ProviderConfig } from "./index";

export const googleProvider: ProviderConfig = {
  id: "google",
  name: "Google Gemini",
  color: "#4285f4",
  apiKeyPlaceholder: "AI...",
  apiKeyPrefix: "AI",
  models: [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", capability: 8, inputCostPer1M: 0.1, outputCostPer1M: 0.4 },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", capability: 9, inputCostPer1M: 1.25, outputCostPer1M: 5 },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", capability: 7, inputCostPer1M: 0.075, outputCostPer1M: 0.3 },
  ],
  validateKey: async (apiKey: string) => {
    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "google",
          apiKey,
          body: {
            model: "gemini-2.0-flash",
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
