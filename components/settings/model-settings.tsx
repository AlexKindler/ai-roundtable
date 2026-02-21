"use client";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { providers } from "@/lib/providers";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModelSettings() {
  const { keys } = useApiKeysStore();
  const { getModelSettings, setModelSettings } = useSettingsStore();

  const activeProviders = Object.entries(keys)
    .filter(([, v]) => v.status === "valid")
    .map(([id]) => providers.find((p) => p.id === id))
    .filter(Boolean);

  if (activeProviders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Connect API keys to configure per-model settings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Per-Model Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeProviders.map((provider) => {
          if (!provider) return null;
          const settings = getModelSettings(provider.id);

          return (
            <div key={provider.id} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: provider.color }}
                />
                <span className="font-medium text-sm">{provider.name}</span>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Temperature</Label>
                  <span className="text-xs text-muted-foreground">{settings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([v]) => setModelSettings(provider.id, { temperature: v })}
                  min={0}
                  max={2}
                  step={0.1}
                />
              </div>

              {/* Max tokens */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Max Tokens</Label>
                  <span className="text-xs text-muted-foreground">{settings.maxTokens}</span>
                </div>
                <Slider
                  value={[settings.maxTokens]}
                  onValueChange={([v]) => setModelSettings(provider.id, { maxTokens: v })}
                  min={256}
                  max={8192}
                  step={256}
                />
              </div>

              {/* System prompt */}
              <div className="space-y-1.5">
                <Label className="text-xs">System Prompt (optional)</Label>
                <Textarea
                  value={settings.systemPrompt}
                  onChange={(e) => setModelSettings(provider.id, { systemPrompt: e.target.value })}
                  placeholder="Custom system prompt for this model..."
                  className="text-xs min-h-[60px]"
                  rows={2}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
