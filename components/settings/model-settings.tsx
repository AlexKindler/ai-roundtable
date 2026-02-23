"use client";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { getModelByKey } from "@/lib/providers/model-registry";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ModelSettings() {
  const { selectedModels } = useApiKeysStore();
  const { getModelSettings, setModelSettings } = useSettingsStore();

  if (selectedModels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select models to configure per-model settings.
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
        {selectedModels.map(({ providerId, modelId }) => {
          const model = getModelByKey(providerId, modelId);
          if (!model) return null;

          const key = `${providerId}:${modelId}`;
          const settings = getModelSettings(key);

          return (
            <div key={key} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: model.providerColor }}
                />
                <span className="font-medium text-sm">{model.modelName}</span>
                <span className="text-xs text-muted-foreground">{model.providerName}</span>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Temperature</Label>
                  <span className="text-xs text-muted-foreground">{settings.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[settings.temperature]}
                  onValueChange={([v]) => setModelSettings(key, { temperature: v })}
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
                  onValueChange={([v]) => setModelSettings(key, { maxTokens: v })}
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
                  onChange={(e) => setModelSettings(key, { systemPrompt: e.target.value })}
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
