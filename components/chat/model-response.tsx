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
    <div
      className="relative rounded-lg border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-4 space-y-2 overflow-hidden"
    >
      {/* Gradient left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-lg"
        style={{ background: `linear-gradient(to bottom, ${response.color}, ${response.color}80)` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full ring-2 ring-white/10"
            style={{ backgroundColor: response.color }}
          />
          <span className="font-medium text-sm">{response.modelName}</span>
          <span className="text-xs text-muted-foreground">{response.providerName}</span>
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
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
          {response.text}
          {response.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      )}
    </div>
  );
}
