"use client";

import { useState } from "react";
import { Copy, Check, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ModelResponse } from "@/lib/stores/roundtable-store";
import { formatTokens, formatCost, estimateCost } from "@/lib/costs";
import { useSettingsStore } from "@/lib/stores/settings-store";

interface FinalAnswerProps {
  response: ModelResponse;
}

export function FinalAnswer({ response }: FinalAnswerProps) {
  const [copied, setCopied] = useState(false);
  const { showTokenCounts, showCostEstimates } = useSettingsStore();

  const cost = response.inputTokens && response.outputTokens
    ? estimateCost(response.providerId, response.modelId, response.inputTokens, response.outputTokens)
    : null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-indigo-500/40 via-purple-500/40 to-pink-500/40">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-xl -z-10" />

      <div className="rounded-xl bg-background/95 backdrop-blur-sm p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-sm bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Final Synthesized Answer
            </span>
            <span className="text-xs text-muted-foreground">
              by {response.modelName}
            </span>
            {response.isStreaming && (
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Token info */}
            {response.isComplete && (showTokenCounts || showCostEstimates) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {showTokenCounts && response.inputTokens != null && (
                  <span>
                    {formatTokens(response.inputTokens)} in / {formatTokens(response.outputTokens || 0)} out
                  </span>
                )}
                {showCostEstimates && cost && (
                  <span>{formatCost(cost.totalCost)}</span>
                )}
              </div>
            )}

            {/* Copy button */}
            {response.isComplete && (
              <Button size="sm" variant="ghost" onClick={handleCopy} className="h-7 px-2">
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
          {response.text}
          {response.isStreaming && (
            <span className="inline-block w-1.5 h-4 bg-foreground/70 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  );
}
