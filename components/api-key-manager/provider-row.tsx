"use client";

import { useState } from "react";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProviderConfig } from "@/lib/providers";
import { useApiKeysStore, type KeyStatus } from "@/lib/stores/api-keys-store";

interface ProviderRowProps {
  provider: ProviderConfig;
}

function StatusIcon({ status }: { status: KeyStatus }) {
  switch (status) {
    case "validating":
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    case "valid":
      return <Check className="h-4 w-4 text-green-500" />;
    case "invalid":
      return <X className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
}

export function ProviderRow({ provider }: ProviderRowProps) {
  const { keys, setApiKey, setSelectedModel, setKeyStatus } = useApiKeysStore();
  const keyState = keys[provider.id] || { apiKey: "", selectedModel: provider.models[0]?.id || "", status: "idle" as KeyStatus };
  const [showKey, setShowKey] = useState(false);
  const [localKey, setLocalKey] = useState(keyState.apiKey);

  const handleValidate = async () => {
    if (!localKey.trim()) return;

    setApiKey(provider.id, localKey);
    setKeyStatus(provider.id, "validating");

    // Set default model if not set
    if (!keyState.selectedModel) {
      setSelectedModel(provider.id, provider.models[0]?.id || "");
    }

    const isValid = await provider.validateKey(localKey);
    setKeyStatus(provider.id, isValid ? "valid" : "invalid");
  };

  const handleKeyChange = (value: string) => {
    setLocalKey(value);
    if (keyState.status !== "idle") {
      setKeyStatus(provider.id, "idle");
    }
  };

  const handleClear = () => {
    setLocalKey("");
    setApiKey(provider.id, "");
    setKeyStatus(provider.id, "idle");
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-4 transition-colors hover:border-border/80">
      {/* Provider color indicator */}
      <div
        className="h-8 w-1 rounded-full shrink-0"
        style={{ backgroundColor: provider.color }}
      />

      {/* Provider name */}
      <div className="w-40 shrink-0">
        <div className="font-medium text-sm">{provider.name}</div>
        <div className="text-xs text-muted-foreground">
          {provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* API Key input */}
      <div className="flex-1 flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? "text" : "password"}
            placeholder={provider.apiKeyPlaceholder}
            value={localKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleValidate()}
            className="pr-8"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>

        <Button
          size="sm"
          variant={keyState.status === "valid" ? "secondary" : "default"}
          onClick={handleValidate}
          disabled={!localKey.trim() || keyState.status === "validating"}
          className="shrink-0"
        >
          {keyState.status === "validating" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : keyState.status === "valid" ? (
            "Revalidate"
          ) : (
            "Validate"
          )}
        </Button>

        {localKey && (
          <Button size="sm" variant="ghost" onClick={handleClear} className="shrink-0 px-2">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Model selector */}
      <Select
        value={keyState.selectedModel || provider.models[0]?.id}
        onValueChange={(val) => setSelectedModel(provider.id, val)}
      >
        <SelectTrigger className="w-44 shrink-0">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {provider.models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status icon */}
      <div className="w-6 shrink-0 flex justify-center">
        <StatusIcon status={keyState.status} />
      </div>
    </div>
  );
}
