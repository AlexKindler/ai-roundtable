"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModelResponseCard } from "./model-response";
import type { ModelResponse } from "@/lib/stores/roundtable-store";

interface RoundSectionProps {
  title: string;
  responses: ModelResponse[];
  defaultOpen?: boolean;
  completedCount?: number;
  totalCount?: number;
}

export function RoundSection({
  title,
  responses,
  defaultOpen = false,
  completedCount,
  totalCount,
}: RoundSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const showProgress = completedCount !== undefined && totalCount !== undefined && completedCount < totalCount;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary/50 transition-colors cursor-pointer">
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span>{title}</span>
        {showProgress && (
          <span className="text-xs text-muted-foreground ml-auto">
            {completedCount}/{totalCount} complete
          </span>
        )}
        {!showProgress && responses.length > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {responses.length} response{responses.length !== 1 ? "s" : ""}
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-2 pl-6 pt-2 pb-1">
          {responses.map((response) => (
            <ModelResponseCard key={response.providerId} response={response} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
