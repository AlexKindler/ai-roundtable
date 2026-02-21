"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RoundtableResult } from "./roundtable-store";

export interface ChatMessage {
  id: string;
  role: "user" | "roundtable";
  content: string; // User message text
  roundtableResult?: RoundtableResult; // For roundtable responses
  timestamp: number;
}

interface ChatState {
  messages: ChatMessage[];
  addUserMessage: (content: string) => string;
  addRoundtableResult: (result: RoundtableResult) => void;
  clearHistory: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],

      addUserMessage: (content) => {
        const id = crypto.randomUUID();
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id,
              role: "user",
              content,
              timestamp: Date.now(),
            },
          ],
        }));
        return id;
      },

      addRoundtableResult: (result) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: result.id,
              role: "roundtable",
              content: result.finalAnswer?.text || "",
              roundtableResult: result,
              timestamp: result.timestamp,
            },
          ],
        })),

      clearHistory: () => set({ messages: [] }),
    }),
    {
      name: "ai-roundtable-chat",
    }
  )
);
