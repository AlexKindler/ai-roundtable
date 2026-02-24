import type { ProviderConfig } from "./index";
import { validateProviderKey } from "./index";

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
    { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision", "reasoning"] },
    { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision", "reasoning"] },
    { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5", capability: 7, inputCostPer1M: 1, outputCostPer1M: 5, category: "speed", contextWindow: 200000, tags: ["speed", "code"] },
    { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet", capability: 8, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision"] },
  ],
  validateKey: (apiKey) => validateProviderKey("anthropic", apiKey, "claude-haiku-4-5-20251001"),
};
