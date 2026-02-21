"use client";

import { useSettingsStore } from "@/lib/stores/settings-store";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DisplaySettings() {
  const {
    defaultView,
    showTokenCounts,
    showCostEstimates,
    setDefaultView,
    setShowTokenCounts,
    setShowCostEstimates,
  } = useSettingsStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Display Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Default view */}
        <div className="space-y-2">
          <Label>Default View</Label>
          <Select value={defaultView} onValueChange={(v) => setDefaultView(v as "final-only" | "all-rounds")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="final-only">Final answer only</SelectItem>
              <SelectItem value="all-rounds">All rounds expanded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Token counts */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Token Counts</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Display input/output token counts per response
            </p>
          </div>
          <Switch checked={showTokenCounts} onCheckedChange={setShowTokenCounts} />
        </div>

        {/* Cost estimates */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Show Cost Estimates</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Display estimated cost per response and total
            </p>
          </div>
          <Switch checked={showCostEstimates} onCheckedChange={setShowCostEstimates} />
        </div>
      </CardContent>
    </Card>
  );
}
