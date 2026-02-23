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

const steps: { key: RoundtableStatus; label: string }[] = [
  { key: "round1", label: "Independent" },
  { key: "round2", label: "Cross-exam" },
  { key: "round2.5", label: "Debate" },
  { key: "round3", label: "Synthesis" },
];

const statusLabels: Record<RoundtableStatus, string> = {
  idle: "",
  round1: "Gathering independent perspectives",
  round2: "Cross-examining responses",
  "round2.5": "Models debating positions",
  round3: "Synthesizing final answer",
  complete: "Complete",
  error: "Error occurred",
};

function getStepState(step: RoundtableStatus, current: RoundtableStatus): "done" | "active" | "pending" {
  const order: RoundtableStatus[] = ["round1", "round2", "round2.5", "round3"];
  const stepIdx = order.indexOf(step);
  const currentIdx = order.indexOf(current);
  if (stepIdx < currentIdx) return "done";
  if (stepIdx === currentIdx) return "active";
  return "pending";
}

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
    progress = `(${round1Count}/${round1Total})`;
  } else if (status === "round2" || status === "round2.5") {
    progress = `(${round2Count}/${round2Total})`;
  }

  return (
    <div className="space-y-3 px-4 py-3 rounded-lg border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const state = getStepState(step.key, status);
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1 gap-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    state === "done"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                      : state === "active"
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"
                        : "bg-white/[0.06]"
                  }`}
                />
                <span
                  className={`text-[10px] transition-colors ${
                    state === "pending" ? "text-muted-foreground/40" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && <div className="w-1 shrink-0" />}
            </div>
          );
        })}
      </div>

      {/* Current status text */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
        <span>
          {label} {progress}
        </span>
      </div>
    </div>
  );
}
