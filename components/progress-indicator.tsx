"use client";

import { Loader2 } from "lucide-react";
import type { RoundtableStatus } from "@/lib/stores/roundtable-store";

interface ProgressIndicatorProps {
  status: RoundtableStatus;
  round1Count: number;
  round1Total: number;
  round2Count: number;
  round2Total: number;
}

const statusLabels: Record<RoundtableStatus, string> = {
  idle: "",
  round1: "Round 1: Gathering independent perspectives",
  round2: "Round 2: Cross-examining responses",
  "round2.5": "Debate Round: Models are arguing their positions",
  round3: "Round 3: Synthesizing final answer",
  complete: "Complete",
  error: "Error occurred",
};

export function ProgressIndicator({
  status,
  round1Count,
  round1Total,
  round2Count,
  round2Total,
}: ProgressIndicatorProps) {
  if (status === "idle" || status === "complete") return null;

  const label = statusLabels[status];
  let progress = "";

  if (status === "round1") {
    const completed = round1Count;
    progress = `(${completed}/${round1Total})`;
  } else if (status === "round2" || status === "round2.5") {
    const completed = round2Count;
    progress = `(${completed}/${round2Total})`;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-in fade-in">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      <span>
        {label} {progress}
      </span>
    </div>
  );
}
