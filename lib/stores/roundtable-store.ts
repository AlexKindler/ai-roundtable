"use client";

import { create } from "zustand";

export interface ModelResponse {
  providerId: string;
  providerName: string;
  modelId: string;
  modelName: string;
  color: string;
  text: string;
  isStreaming: boolean;
  isComplete: boolean;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}

// Composite key for matching responses (supports multiple models per provider)
export function responseKey(providerId: string, modelId: string): string {
  return `${providerId}:${modelId}`;
}

export interface RoundtableResult {
  id: string;
  prompt: string;
  round1: ModelResponse[];
  round2: ModelResponse[];
  round2_5?: ModelResponse[]; // Debate mode
  finalAnswer: ModelResponse | null;
  timestamp: number;
}

export type RoundtableStatus = "idle" | "round1" | "round2" | "round2.5" | "round3" | "complete" | "error";

interface RoundtableState {
  status: RoundtableStatus;
  currentResult: RoundtableResult | null;
  error: string | null;

  setStatus: (status: RoundtableStatus) => void;
  initResult: (id: string, prompt: string) => void;
  updateRound1Response: (providerId: string, modelId: string, update: Partial<ModelResponse>) => void;
  addRound1Response: (response: ModelResponse) => void;
  updateRound2Response: (providerId: string, modelId: string, update: Partial<ModelResponse>) => void;
  addRound2Response: (response: ModelResponse) => void;
  updateRound2_5Response: (providerId: string, modelId: string, update: Partial<ModelResponse>) => void;
  addRound2_5Response: (response: ModelResponse) => void;
  setFinalAnswer: (response: ModelResponse) => void;
  updateFinalAnswer: (update: Partial<ModelResponse>) => void;
  setError: (error: string) => void;
  reset: () => void;
}

function matchResponse(r: ModelResponse, providerId: string, modelId: string): boolean {
  return r.providerId === providerId && r.modelId === modelId;
}

export const useRoundtableStore = create<RoundtableState>()((set) => ({
  status: "idle",
  currentResult: null,
  error: null,

  setStatus: (status) => set({ status }),

  initResult: (id, prompt) =>
    set({
      currentResult: {
        id,
        prompt,
        round1: [],
        round2: [],
        finalAnswer: null,
        timestamp: Date.now(),
      },
      status: "round1",
      error: null,
    }),

  addRound1Response: (response) =>
    set((state) => ({
      currentResult: state.currentResult
        ? { ...state.currentResult, round1: [...state.currentResult.round1, response] }
        : null,
    })),

  updateRound1Response: (providerId, modelId, update) =>
    set((state) => ({
      currentResult: state.currentResult
        ? {
            ...state.currentResult,
            round1: state.currentResult.round1.map((r) =>
              matchResponse(r, providerId, modelId) ? { ...r, ...update } : r
            ),
          }
        : null,
    })),

  addRound2Response: (response) =>
    set((state) => ({
      currentResult: state.currentResult
        ? { ...state.currentResult, round2: [...state.currentResult.round2, response] }
        : null,
    })),

  updateRound2Response: (providerId, modelId, update) =>
    set((state) => ({
      currentResult: state.currentResult
        ? {
            ...state.currentResult,
            round2: state.currentResult.round2.map((r) =>
              matchResponse(r, providerId, modelId) ? { ...r, ...update } : r
            ),
          }
        : null,
    })),

  addRound2_5Response: (response) =>
    set((state) => ({
      currentResult: state.currentResult
        ? {
            ...state.currentResult,
            round2_5: [...(state.currentResult.round2_5 || []), response],
          }
        : null,
    })),

  updateRound2_5Response: (providerId, modelId, update) =>
    set((state) => ({
      currentResult: state.currentResult
        ? {
            ...state.currentResult,
            round2_5: (state.currentResult.round2_5 || []).map((r) =>
              matchResponse(r, providerId, modelId) ? { ...r, ...update } : r
            ),
          }
        : null,
    })),

  setFinalAnswer: (response) =>
    set((state) => ({
      currentResult: state.currentResult
        ? { ...state.currentResult, finalAnswer: response }
        : null,
    })),

  updateFinalAnswer: (update) =>
    set((state) => ({
      currentResult: state.currentResult
        ? {
            ...state.currentResult,
            finalAnswer: state.currentResult.finalAnswer
              ? { ...state.currentResult.finalAnswer, ...update }
              : null,
          }
        : null,
    })),

  setError: (error) => set({ error, status: "error" }),

  reset: () => set({ status: "idle", currentResult: null, error: null }),
}));
