"use client";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { getModelByKey } from "@/lib/providers/model-registry";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, MessageSquare, Swords } from "lucide-react";

export function DeliberationSettings() {
  const {
    deliberationRounds,
    deliberationMode,
    synthesizerModel,
    setDeliberationRounds,
    setDeliberationMode,
    setSynthesizerModel,
  } = useSettingsStore();
  const { selectedModels } = useApiKeysStore();

  const selectedModelInfo = selectedModels
    .map((sm) => ({ ...sm, model: getModelByKey(sm.providerId, sm.modelId) }))
    .filter((sm) => sm.model);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Deliberation Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Number of rounds */}
        <div className="space-y-2">
          <Label>Number of Rounds</Label>
          <Select
            value={String(deliberationRounds)}
            onValueChange={(v) => setDeliberationRounds(Number(v) as 2 | 3)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 rounds (Independent + Synthesis)</SelectItem>
              <SelectItem value="3">3 rounds (Independent + Cross-exam + Synthesis)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deliberation mode */}
        <div className="space-y-2">
          <Label>Mode</Label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setDeliberationMode("standard")}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors cursor-pointer ${
                deliberationMode === "standard"
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-border hover:border-border/80"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Standard</span>
              <span className="text-muted-foreground">Full deliberation</span>
            </button>
            <button
              onClick={() => setDeliberationMode("quick")}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors cursor-pointer ${
                deliberationMode === "quick"
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-border hover:border-border/80"
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="font-medium">Quick</span>
              <span className="text-muted-foreground">Skip cross-exam</span>
            </button>
            <button
              onClick={() => setDeliberationMode("debate")}
              className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs transition-colors cursor-pointer ${
                deliberationMode === "debate"
                  ? "border-indigo-500/40 bg-indigo-500/10"
                  : "border-border hover:border-border/80"
              }`}
            >
              <Swords className="h-4 w-4" />
              <span className="font-medium">Debate</span>
              <span className="text-muted-foreground">Extra debate round</span>
            </button>
          </div>
        </div>

        {/* Synthesizer model */}
        <div className="space-y-2">
          <Label>Synthesizer Model</Label>
          <Select value={synthesizerModel} onValueChange={setSynthesizerModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (highest capability)</SelectItem>
              {selectedModelInfo.map(({ providerId, modelId, model }) =>
                model ? (
                  <SelectItem key={`${providerId}:${modelId}`} value={`${providerId}:${modelId}`}>
                    {model.modelName} ({model.providerName})
                  </SelectItem>
                ) : null
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            The synthesizer produces the final answer using all other responses.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
