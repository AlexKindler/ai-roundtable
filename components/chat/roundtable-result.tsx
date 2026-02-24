"use client";

import { RoundSection } from "./round-section";
import { FinalAnswer } from "./final-answer";
import type { RoundtableResult as RoundtableResultType } from "@/lib/stores/roundtable-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { estimateCost, formatCost } from "@/lib/costs";

interface RoundtableResultProps {
  result: RoundtableResultType;
}

export function RoundtableResult({ result }: RoundtableResultProps) {
  const { showCostEstimates } = useSettingsStore();

  // Calculate total cost
  const allResponses = [
    ...result.round1,
    ...result.round2,
    ...(result.round2_5 || []),
    ...(result.finalAnswer ? [result.finalAnswer] : []),
  ];

  const totalCost = allResponses.reduce((sum, r) => {
    if (r.inputTokens && r.outputTokens) {
      const c = estimateCost(r.providerId, r.modelId, r.inputTokens, r.outputTokens);
      return sum + c.totalCost;
    }
    return sum;
  }, 0);

  // Build round groups for the details section
  const roundGroups = [
    ...(result.round1.length > 0 ? [{ title: "Round 1: Independent Answers", responses: result.round1 }] : []),
    ...(result.round2.length > 0 ? [{ title: "Round 2: Cross-Examination", responses: result.round2 }] : []),
    ...(result.round2_5 && result.round2_5.length > 0 ? [{ title: "Debate Round", responses: result.round2_5 }] : []),
  ];

  return (
    <div className="space-y-3">
      {/* Final answer first (most prominent) */}
      {result.finalAnswer && <FinalAnswer response={result.finalAnswer} />}

      {/* All rounds collapsed into a single "View Details" section */}
      {roundGroups.length > 0 && (
        <RoundSection
          title="View Details — Individual Model Responses"
          responses={[]}
          defaultOpen={false}
          roundGroups={roundGroups}
        />
      )}

      {/* Total cost */}
      {showCostEstimates && totalCost > 0 && (
        <div className="text-xs text-muted-foreground text-right pr-2">
          Total roundtable cost: {formatCost(totalCost)}
        </div>
      )}
    </div>
  );
}
