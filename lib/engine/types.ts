import type { ActiveModel } from "@/lib/providers";

export interface DeliberationConfig {
  prompt: string;
  models: ActiveModel[];
  rounds: 2 | 3;
  mode: "standard" | "quick" | "debate";
  synthesizerModel: string; // "auto" or "providerId"
  modelSettings: Record<string, { temperature: number; maxTokens: number; systemPrompt: string }>;
}

export interface StreamCallbacks {
  onRound1Start: () => void;
  onRound1Token: (providerId: string, token: string) => void;
  onRound1Complete: (providerId: string, text: string, inputTokens?: number, outputTokens?: number) => void;
  onRound1Error: (providerId: string, error: string) => void;

  onRound2Start: () => void;
  onRound2Token: (providerId: string, token: string) => void;
  onRound2Complete: (providerId: string, text: string, inputTokens?: number, outputTokens?: number) => void;
  onRound2Error: (providerId: string, error: string) => void;

  onRound2_5Start: () => void;
  onRound2_5Token: (providerId: string, token: string) => void;
  onRound2_5Complete: (providerId: string, text: string, inputTokens?: number, outputTokens?: number) => void;
  onRound2_5Error: (providerId: string, error: string) => void;

  onRound3Start: () => void;
  onRound3Token: (providerId: string, token: string) => void;
  onRound3Complete: (providerId: string, text: string, inputTokens?: number, outputTokens?: number) => void;
  onRound3Error: (providerId: string, error: string) => void;

  onComplete: () => void;
  onError: (error: string) => void;
}
