import { providers } from "./providers";

export interface CostEstimate {
  providerId: string;
  modelId: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export function estimateCost(
  providerId: string,
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const provider = providers.find((p) => p.id === providerId);
  const model = provider?.models.find((m) => m.id === modelId);

  const inputCostPer1M = model?.inputCostPer1M || 0;
  const outputCostPer1M = model?.outputCostPer1M || 0;

  const inputCost = (inputTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M;

  return {
    providerId,
    modelId,
    inputTokens,
    outputTokens,
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${cost.toFixed(4)}`;
  }
  return `$${cost.toFixed(2)}`;
}

export function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}
