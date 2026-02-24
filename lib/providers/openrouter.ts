import type { ProviderConfig } from "./index";
import { validateProviderKey } from "./index";

export const openrouterProvider: ProviderConfig = {
  id: "openrouter",
  name: "OpenRouter",
  color: "#6366f1",
  apiKeyPlaceholder: "sk-or-...",
  apiKeyPrefix: "sk-or-",
  setupUrl: "https://openrouter.ai/keys",
  setupInstructions: "1. Sign in at openrouter.ai\n2. Go to Keys\n3. Click 'Create Key'\n4. Copy and paste below",
  models: [
    // OpenAI via Router
    { id: "openai/gpt-4o", name: "GPT-4o (via Router)", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 128000, tags: ["vision", "code"] },
    { id: "openai/gpt-4.1", name: "GPT-4.1 (via Router)", capability: 10, inputCostPer1M: 2, outputCostPer1M: 8, category: "flagship", contextWindow: 1047576, tags: ["code", "vision"] },
    // Anthropic via Router
    { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4 (via Router)", capability: 9, inputCostPer1M: 3, outputCostPer1M: 15, category: "flagship", contextWindow: 200000, tags: ["code", "vision"] },
    // Google via Router
    { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro (via Router)", capability: 10, inputCostPer1M: 1.25, outputCostPer1M: 10, category: "flagship", contextWindow: 1048576, tags: ["reasoning", "vision"] },
    { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash (via Router)", capability: 8, inputCostPer1M: 0.1, outputCostPer1M: 0.4, category: "speed", contextWindow: 1048576, tags: ["speed", "vision"] },
    // Meta via Router
    { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (via Router)", capability: 8, inputCostPer1M: 0.4, outputCostPer1M: 0.4, category: "mid", contextWindow: 128000, tags: ["code"] },
    { id: "meta-llama/llama-4-maverick", name: "Llama 4 Maverick (via Router)", capability: 9, inputCostPer1M: 0.2, outputCostPer1M: 0.6, category: "flagship", contextWindow: 1048576, tags: ["code", "reasoning"] },
    { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout (via Router)", capability: 8, inputCostPer1M: 0.15, outputCostPer1M: 0.4, category: "mid", contextWindow: 512000, tags: ["code"] },
    // DeepSeek via Router
    { id: "deepseek/deepseek-r1", name: "DeepSeek R1 (via Router)", capability: 9, inputCostPer1M: 0.55, outputCostPer1M: 2.19, category: "reasoning", contextWindow: 128000, tags: ["reasoning", "code"] },
    { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek V3 (via Router)", capability: 8, inputCostPer1M: 0.14, outputCostPer1M: 0.28, category: "flagship", contextWindow: 128000, tags: ["code"] },
    // Qwen via Router
    { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B (via Router)", capability: 8, inputCostPer1M: 0.36, outputCostPer1M: 0.36, category: "mid", contextWindow: 131072, tags: ["code", "reasoning"] },
    { id: "qwen/qwen-2.5-coder-32b-instruct", name: "Qwen 2.5 Coder 32B (via Router)", capability: 7, inputCostPer1M: 0.2, outputCostPer1M: 0.2, category: "mid", contextWindow: 32768, tags: ["code"] },
    { id: "qwen/qwq-32b", name: "QwQ 32B (via Router)", capability: 8, inputCostPer1M: 0.2, outputCostPer1M: 0.2, category: "reasoning", contextWindow: 131072, tags: ["reasoning", "math"] },
    // Microsoft via Router
    { id: "microsoft/phi-4", name: "Phi-4 (via Router)", capability: 7, inputCostPer1M: 0.07, outputCostPer1M: 0.07, category: "budget", contextWindow: 16384, tags: ["code", "speed"] },
    { id: "microsoft/mai-ds-r1", name: "MAI DS R1 (via Router)", capability: 8, inputCostPer1M: 0.2, outputCostPer1M: 0.8, category: "reasoning", contextWindow: 128000, tags: ["reasoning"] },
    // NVIDIA via Router
    { id: "nvidia/llama-3.1-nemotron-70b-instruct", name: "Nemotron 70B (via Router)", capability: 8, inputCostPer1M: 0.35, outputCostPer1M: 0.4, category: "mid", contextWindow: 128000, tags: ["code"] },
    // Mistral via Router
    { id: "mistralai/mistral-large-2411", name: "Mistral Large 2 (via Router)", capability: 9, inputCostPer1M: 2, outputCostPer1M: 6, category: "flagship", contextWindow: 128000, tags: ["code", "reasoning"] },
    { id: "mistralai/codestral-2501", name: "Codestral (via Router)", capability: 8, inputCostPer1M: 0.3, outputCostPer1M: 0.9, category: "mid", contextWindow: 256000, tags: ["code"] },
    // Cohere via Router
    { id: "cohere/command-a-03-2025", name: "Command A (via Router)", capability: 9, inputCostPer1M: 2.5, outputCostPer1M: 10, category: "flagship", contextWindow: 256000, tags: ["code"] },
  ],
  getBaseURL: () => "https://openrouter.ai/api/v1",
  validateKey: (apiKey) => validateProviderKey("openrouter", apiKey, "openai/gpt-4o-mini"),
};
