"use client";

import { Check, Lock } from "lucide-react";
import type { RegisteredModel } from "@/lib/providers/model-registry";
import { cn } from "@/lib/utils";

interface ModelCardProps {
  model: RegisteredModel;
  isSelected: boolean;
  isAuthenticated: boolean;
  onToggle: () => void;
}

const categoryColors: Record<string, string> = {
  flagship: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  mid: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  budget: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  reasoning: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  speed: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
};

function formatContext(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k`;
  return String(tokens);
}

export function ModelCard({ model, isSelected, isAuthenticated, onToggle }: ModelCardProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer",
        isSelected
          ? "border-indigo-500/40 bg-indigo-500/[0.07]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.1]"
      )}
    >
      {/* Checkbox / lock */}
      <div className="shrink-0 w-5 h-5 rounded flex items-center justify-center">
        {!isAuthenticated ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : isSelected ? (
          <div className="w-4 h-4 rounded bg-indigo-500 flex items-center justify-center">
            <Check className="h-3 w-3 text-white" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded border border-white/20" />
        )}
      </div>

      {/* Provider dot + model info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: model.providerColor }}
          />
          <span className="text-[11px] text-muted-foreground">{model.providerName}</span>
        </div>
        <div className="text-sm font-medium truncate mt-0.5">{model.modelName}</div>
      </div>

      {/* Right side: metadata */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Category chip */}
        <span className={cn(
          "text-[10px] font-medium px-1.5 py-0.5 rounded border",
          categoryColors[model.category] || "text-muted-foreground"
        )}>
          {model.category}
        </span>

        {/* Context window */}
        <span className="text-[10px] text-muted-foreground w-10 text-right">
          {formatContext(model.contextWindow)}
        </span>

        {/* Cost */}
        <span className="text-[10px] text-muted-foreground w-16 text-right">
          ${model.inputCostPer1M < 0.01 ? model.inputCostPer1M.toFixed(3) : model.inputCostPer1M.toFixed(2)}/M
        </span>
      </div>
    </button>
  );
}
