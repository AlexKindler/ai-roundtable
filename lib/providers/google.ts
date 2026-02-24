import type { ProviderConfig } from "./index";
import { validateProviderKey } from "./index";

export const googleProvider: ProviderConfig = {
  id: "google",
  name: "Google Gemini",
  color: "#4285f4",
  apiKeyPlaceholder: "AI...",
  apiKeyPrefix: "AI",
  setupUrl: "https://aistudio.google.com/apikey",
  setupInstructions: "1. Sign in at aistudio.google.com\n2. Click 'Get API Key'\n3. Create a key in a new or existing project\n4. Copy and paste below",
  models: [
    { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", capability: 10, inputCostPer1M: 1.25, outputCostPer1M: 10, category: "flagship", contextWindow: 1048576, tags: ["reasoning", "code", "vision"] },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", capability: 8, inputCostPer1M: 0.15, outputCostPer1M: 0.6, category: "speed", contextWindow: 1048576, tags: ["speed", "code", "vision"] },
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", capability: 8, inputCostPer1M: 0.1, outputCostPer1M: 0.4, category: "speed", contextWindow: 1048576, tags: ["speed", "vision"] },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite", capability: 6, inputCostPer1M: 0.075, outputCostPer1M: 0.3, category: "budget", contextWindow: 1048576, tags: ["speed"] },
    { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", capability: 9, inputCostPer1M: 1.25, outputCostPer1M: 5, category: "flagship", contextWindow: 2097152, tags: ["vision", "code"] },
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", capability: 7, inputCostPer1M: 0.075, outputCostPer1M: 0.3, category: "speed", contextWindow: 1048576, tags: ["speed", "vision"] },
    { id: "gemini-1.5-flash-8b", name: "Gemini 1.5 Flash 8B", capability: 5, inputCostPer1M: 0.0375, outputCostPer1M: 0.15, category: "budget", contextWindow: 1048576, tags: ["speed"] },
  ],
  validateKey: (apiKey) => validateProviderKey("google", apiKey, "gemini-2.0-flash"),
};
