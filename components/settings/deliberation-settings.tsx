"use client";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { providers } from "@/lib/providers";
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
  const { keys } = useApiKeysStore();

  // Get active providers for synthesizer selection
  const activeProviders = Object.entries(keys)
    .filter(([, v]) => v.status === "valid")
    .map(([id]) => providers.find((p) => p.id === id))
    .filter(Boolean);

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
                  ? "border-primary bg-primary/10"
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
                  ? "border-primary bg-primary/10"
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
                  ? "border-primary bg-primary/10"
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
              {activeProviders.map((provider) =>
                provider ? (
                  <SelectItem key={provider.id} value={provider.id}>
                    {provider.name}
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
