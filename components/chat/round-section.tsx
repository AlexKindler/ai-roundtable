"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ModelResponseCard } from "./model-response";
import { responseKey, type ModelResponse } from "@/lib/stores/roundtable-store";

interface RoundGroup {
  title: string;
  responses: ModelResponse[];
  completedCount?: number;
  totalCount?: number;
}

interface RoundSectionProps {
  title: string;
  responses: ModelResponse[];
  defaultOpen?: boolean;
  completedCount?: number;
  totalCount?: number;
  /** When provided, renders multiple sub-rounds inside this collapsible */
  roundGroups?: RoundGroup[];
}

export function RoundSection({
  title,
  responses,
  defaultOpen = false,
  completedCount,
  totalCount,
  roundGroups,
}: RoundSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const showProgress = completedCount !== undefined && totalCount !== undefined && completedCount < totalCount;

  // Count total responses across all groups for the badge
  const totalResponses = roundGroups
    ? roundGroups.reduce((sum, g) => sum + g.responses.length, 0)
    : responses.length;

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
        {!showProgress && totalResponses > 0 && (
          <span className="text-xs text-muted-foreground ml-auto">
            {totalResponses} response{totalResponses !== 1 ? "s" : ""}
          </span>
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        {roundGroups ? (
          <div className="space-y-4 pl-4 pt-2 pb-1">
            {roundGroups.map((group) => (
              <div key={group.title} className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium px-2">
                  <span>{group.title}</span>
                  {group.completedCount !== undefined && group.totalCount !== undefined && group.completedCount < group.totalCount && (
                    <span className="ml-auto">{group.completedCount}/{group.totalCount} complete</span>
                  )}
                </div>
                <div className="space-y-2 pl-2">
                  {group.responses.map((response) => (
                    <ModelResponseCard key={responseKey(response.providerId, response.modelId)} response={response} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pl-6 pt-2 pb-1">
            {responses.map((response) => (
              <ModelResponseCard key={responseKey(response.providerId, response.modelId)} response={response} />
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
