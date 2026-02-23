"use client";

import { useState } from "react";
import Link from "next/link";
import { Settings, Key, X } from "lucide-react";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatView } from "@/components/chat/chat-view";
import { ApiKeyManager } from "@/components/api-key-manager/api-key-manager";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { useChatStore } from "@/lib/stores/chat-store";

export default function Home() {
  const [showKeyManager, setShowKeyManager] = useState(false);
  const { keys, hasMinimumProviders } = useApiKeysStore();
  const { messages, clearHistory } = useChatStore();

  const validCount = Object.values(keys).filter((k) => k.status === "valid").length;
  const hasMinimum = hasMinimumProviders();

  // Show key manager by default if no keys configured
  const shouldShowSetup = !hasMinimum && !showKeyManager && messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">AI Roundtable</h1>
          <Badge variant="secondary" className="text-xs">
            {validCount} model{validCount !== 1 ? "s" : ""} connected
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearHistory} className="text-xs text-muted-foreground">
              Clear history
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowKeyManager(!showKeyManager)}
          >
            <Key className="h-4 w-4 mr-1" />
            API Keys
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* API Key Manager Panel (slide down) */}
      {(showKeyManager || shouldShowSetup) && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-4xl px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div />
              {!shouldShowSetup && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowKeyManager(false)}
                  className="h-7 w-7"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <ApiKeyManager />
            {shouldShowSetup && hasMinimum && (
              <div className="flex justify-center mt-4">
                <Button onClick={() => setShowKeyManager(false)}>
                  Start Roundtable
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden">
        {hasMinimum ? (
          <ChatView />
        ) : (
          !showKeyManager && !shouldShowSetup && (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <p className="text-sm">Connect at least 2 AI providers to start</p>
              <Button variant="outline" onClick={() => setShowKeyManager(true)}>
                <Key className="h-4 w-4 mr-2" />
                Set Up API Keys
              </Button>
            </div>
          )
        )}
      </main>
    </div>
  );
}
