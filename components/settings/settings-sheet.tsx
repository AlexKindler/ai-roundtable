"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { DeliberationSettings } from "./deliberation-settings";
import { DisplaySettings } from "./display-settings";
import { ModelSettings } from "./model-settings";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure deliberation, display, and per-model settings.
          </SheetDescription>
        </SheetHeader>

        <div className="px-6 pb-6 space-y-6">
          <DeliberationSettings />
          <DisplaySettings />
          <ModelSettings />
        </div>
      </SheetContent>
    </Sheet>
  );
}
