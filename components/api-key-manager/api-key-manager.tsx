"use client";

import { providers } from "@/lib/providers";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { ProviderRow } from "./provider-row";
import { Badge } from "@/components/ui/badge";
import { Shield, Key } from "lucide-react";

export function ApiKeyManager() {
  const { keys } = useApiKeysStore();

  const validCount = Object.values(keys).filter((k) => k.status === "valid").length;
  const hasMinimum = validCount >= 2;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">Connect Your AI Models</h2>
            <p className="text-sm text-muted-foreground">
              Add API keys for at least 2 providers to start a roundtable
            </p>
          </div>
        </div>
        <Badge variant={hasMinimum ? "default" : "secondary"}>
          {validCount} / {providers.length} connected
        </Badge>
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground">
        <Shield className="h-4 w-4 shrink-0" />
        <span>
          API keys are stored locally in your browser and sent only to the respective provider APIs.
          They are never stored on our servers.
        </span>
      </div>

      {/* Provider list */}
      <div className="space-y-2">
        {providers.map((provider) => (
          <ProviderRow key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Minimum requirement warning */}
      {!hasMinimum && validCount > 0 && (
        <p className="text-sm text-amber-500 text-center">
          Connect at least {2 - validCount} more provider{2 - validCount !== 1 ? "s" : ""} to start a roundtable discussion
        </p>
      )}
    </div>
  );
}
