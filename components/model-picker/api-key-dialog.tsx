"use client";

import { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2, Check, Shield, Eye, EyeOff, ExternalLink, ArrowRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModelCard } from "./model-card";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { providers } from "@/lib/providers";
import { modelRegistry } from "@/lib/providers/model-registry";

interface ApiKeyDialogProps {
  providerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDone: () => void;
}

type WizardStep = "instructions" | "enter-key" | "choose-models";

export function ApiKeyDialog({ providerId, open, onOpenChange, onDone }: ApiKeyDialogProps) {
  const provider = providers.find((p) => p.id === providerId);
  const { isProviderAuthenticated, isModelSelected, addSelectedModel, removeSelectedModel } = useApiKeysStore();

  const isConnected = isProviderAuthenticated(providerId);

  // Determine initial step: skip to model selection if already authenticated
  const [step, setStep] = useState<WizardStep>(isConnected ? "choose-models" : "instructions");
  const [localKey, setLocalKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");

  const { setApiKey, setKeyStatus } = useApiKeysStore();

  const providerModels = useMemo(() => {
    return modelRegistry.filter((m) => m.providerId === providerId);
  }, [providerId]);

  if (!provider) return null;

  const handleValidate = async () => {
    if (!localKey.trim()) return;

    setValidating(true);
    setError("");

    setApiKey(providerId, localKey);
    setKeyStatus(providerId, "validating");

    const result = await provider.validateKey(localKey);

    if (result.valid) {
      setKeyStatus(providerId, "valid");
      setStep("choose-models");
      setLocalKey("");
    } else {
      setKeyStatus(providerId, "invalid");
      setError(result.error || "Invalid API key. Please check and try again.");
    }
    setValidating(false);
  };

  const handleToggleModel = (pId: string, mId: string) => {
    if (isModelSelected(pId, mId)) {
      removeSelectedModel(pId, mId);
    } else {
      addSelectedModel(pId, mId);
    }
  };

  const stepTitle = {
    instructions: "Get Your API Key",
    "enter-key": "Enter Your API Key",
    "choose-models": "Choose Models",
  }[step];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/[0.08] bg-card p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            {step !== "instructions" && !isConnected && (
              <button
                onClick={() => setStep(step === "choose-models" ? "enter-key" : "instructions")}
                className="rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: provider.color }}
            />
            <Dialog.Title className="text-base font-semibold">
              {provider.name} &mdash; {stepTitle}
            </Dialog.Title>
            <Dialog.Close className="ml-auto rounded-sm opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Step indicators */}
          {!isConnected && (
            <div className="flex items-center gap-1.5 mb-5 ml-[26px]">
              {(["instructions", "enter-key", "choose-models"] as WizardStep[]).map((s, i) => (
                <div
                  key={s}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    step === s
                      ? "bg-indigo-500"
                      : (["instructions", "enter-key", "choose-models"].indexOf(step) > i)
                        ? "bg-indigo-500/40"
                        : "bg-white/[0.08]"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Step 1: Instructions */}
          {step === "instructions" && (
            <div className="space-y-4">
              <Dialog.Description className="text-sm text-muted-foreground">
                Follow the steps below to get your API key from {provider.name}.
              </Dialog.Description>

              <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 space-y-2">
                {provider.setupInstructions.split("\n").map((line, i) => (
                  <p key={i} className="text-sm text-foreground/80">{line}</p>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.open(provider.setupUrl, "_blank", "noopener")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get API Key
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep("enter-key")}
                >
                  I have my key
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Enter Key */}
          {step === "enter-key" && (
            <div className="space-y-3">
              <Dialog.Description className="text-sm text-muted-foreground mb-4">
                Paste your {provider.name} API key below to connect.
              </Dialog.Description>

              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={provider.apiKeyPlaceholder}
                  value={localKey}
                  onChange={(e) => { setLocalKey(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleValidate()}
                  className="pr-10"
                  autoFocus
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
          )}

          {/* Step 3: Choose Models */}
          {step === "choose-models" && (
            <div className="space-y-3">
              <Dialog.Description className="text-sm text-muted-foreground">
                Select the models you want to include in your roundtable.
              </Dialog.Description>

              <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                {providerModels.map((model) => (
                  <ModelCard
                    key={`${model.providerId}:${model.modelId}`}
                    model={model}
                    isSelected={isModelSelected(model.providerId, model.modelId)}
                    onToggle={() => handleToggleModel(model.providerId, model.modelId)}
                  />
                ))}
              </div>

              <Button className="w-full" onClick={onDone}>
                Done
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
