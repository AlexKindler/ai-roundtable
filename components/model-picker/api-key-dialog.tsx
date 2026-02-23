"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Check, Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { providers } from "@/lib/providers";

interface ApiKeyDialogProps {
  providerId: string;
  modelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApiKeyDialog({ providerId, modelId, open, onOpenChange, onSuccess }: ApiKeyDialogProps) {
  const [localKey, setLocalKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const { setApiKey, setKeyStatus, addSelectedModel } = useApiKeysStore();

  const provider = providers.find((p) => p.id === providerId);
  if (!provider) return null;

  const handleValidate = async () => {
    if (!localKey.trim()) return;

    setValidating(true);
    setError("");

    setApiKey(providerId, localKey);
    setKeyStatus(providerId, "validating");

    const isValid = await provider.validateKey(localKey);

    if (isValid) {
      setKeyStatus(providerId, "valid");
      addSelectedModel(providerId, modelId);
      onSuccess();
      onOpenChange(false);
      setLocalKey("");
    } else {
      setKeyStatus(providerId, "invalid");
      setError("Invalid API key. Please check and try again.");
    }
    setValidating(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.08] bg-card p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: provider.color }}
            />
            <Dialog.Title className="text-base font-semibold">
              Connect {provider.name}
            </Dialog.Title>
            <Dialog.Close className="ml-auto rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          <Dialog.Description className="text-sm text-muted-foreground mb-4">
            Enter your API key to use models from {provider.name}.
          </Dialog.Description>

          {/* Input */}
          <div className="space-y-3">
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder={provider.apiKeyPlaceholder}
                value={localKey}
                onChange={(e) => { setLocalKey(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
              onClick={handleValidate}
              disabled={!localKey.trim() || validating}
              className="w-full"
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Validate & Connect
                </>
              )}
            </Button>

            {/* Privacy notice */}
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span>Keys are encrypted and stored locally. Never shared with third parties.</span>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
