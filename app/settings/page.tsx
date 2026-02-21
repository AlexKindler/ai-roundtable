"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeliberationSettings } from "@/components/settings/deliberation-settings";
import { DisplaySettings } from "@/components/settings/display-settings";
import { ModelSettings } from "@/components/settings/model-settings";
import { ApiKeyManager } from "@/components/api-key-manager/api-key-manager";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>

        {/* API Keys */}
        <ApiKeyManager />

        {/* Deliberation settings */}
        <DeliberationSettings />

        {/* Display settings */}
        <DisplaySettings />

        {/* Per-model settings */}
        <ModelSettings />
      </div>
    </div>
  );
}
