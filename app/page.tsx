"use client";

import { useState } from "react";
import { Settings, Layers, Sparkles } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { ChatView } from "@/components/chat/chat-view";
import { ModelPicker } from "@/components/model-picker/model-picker";
import { WelcomeScreen } from "@/components/onboarding/welcome-screen";
import { SettingsSheet } from "@/components/settings/settings-sheet";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { getModelByKey } from "@/lib/providers/model-registry";

export default function Home() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { selectedModels, hasMinimumModels } = useApiKeysStore();
  const { messages, clearHistory } = useChatStore();

  const hasMinimum = hasMinimumModels();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.06] bg-background/70 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              AI Roundtable
            </h1>
          </div>

          {/* Model dot indicators */}
          {selectedModels.length > 0 && (
            <div className="flex items-center gap-1 ml-2">
              {selectedModels.slice(0, 8).map(({ providerId, modelId }) => {
                const model = getModelByKey(providerId, modelId);
                return model ? (
                  <div
                    key={`${providerId}:${modelId}`}
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: model.providerColor }}
                    title={`${model.modelName} (${model.providerName})`}
                  />
                ) : null;
              })}
              {selectedModels.length > 8 && (
                <span className="text-[10px] text-muted-foreground ml-0.5">
                  +{selectedModels.length - 8}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground">
              Clear
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPickerOpen(true)}
            className="gap-1.5"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Models</span>
            <span className="text-xs text-muted-foreground">
              ({selectedModels.length})
            </span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <UserMenu />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {hasMinimum ? (
          <ChatView />
        ) : (
          <WelcomeScreen />
        )}
      </main>

      {/* Model Picker Sheet */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="right" className="overflow-y-auto w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>Select Models</SheetTitle>
            <SheetDescription>
              Choose AI models for your roundtable. You need at least 2 to start.
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 pb-6">
            <ModelPicker />
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
