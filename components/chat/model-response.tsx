"use client";

import { Loader2, AlertCircle } from "lucide-react";
import type { ModelResponse } from "@/lib/stores/roundtable-store";
import { formatTokens, formatCost, estimateCost } from "@/lib/costs";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface ModelResponseCardProps {
  response: ModelResponse;
}

export function ModelResponseCard({ response }: ModelResponseCardProps) {
  const { showTokenCounts, showCostEstimates } = useSettingsStore();

  const cost = response.inputTokens && response.outputTokens
    ? estimateCost(response.providerId, response.modelId, response.inputTokens, response.outputTokens)
    : null;

  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: response.color }}
          />
          <span className="font-medium text-sm">{response.providerName}</span>
          {response.isStreaming && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Token info */}
        {response.isComplete && (showTokenCounts || showCostEstimates) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {showTokenCounts && response.inputTokens != null && (
              <span>
                {formatTokens(response.inputTokens)} in / {formatTokens(response.outputTokens || 0)} out
              </span>
            )}
            {showCostEstimates && cost && (
              <span className="text-muted-foreground/70">{formatCost(cost.totalCost)}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {response.error ? (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{response.error}</span>
        </div>
      ) : (
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {response.text}
          {response.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
