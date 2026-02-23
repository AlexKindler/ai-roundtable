"use client";

import { X } from "lucide-react";

interface SelectedModelChipProps {
  providerColor: string;
  modelName: string;
  providerName: string;
  onRemove: () => void;
}

export function SelectedModelChip({ providerColor, modelName, providerName, onRemove }: SelectedModelChipProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border border-white/[0.08] bg-white/[0.04] transition-colors hover:bg-white/[0.08]"
    >
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: providerColor }}
      />
      <span className="truncate max-w-[120px]" title={`${providerName} — ${modelName}`}>
        {modelName}
      </span>
      <button
        onClick={onRemove}
        className="ml-0.5 rounded-full p-0.5 hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
