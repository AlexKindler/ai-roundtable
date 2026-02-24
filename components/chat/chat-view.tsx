"use client";

import { useRef, useEffect, useCallback } from "react";
import { MessageInput } from "./message-input";
import { RoundtableResult } from "./roundtable-result";
import { RoundSection } from "./round-section";
import { FinalAnswer } from "./final-answer";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useRoundtableStore, responseKey } from "@/lib/stores/roundtable-store";
import { useChatStore } from "@/lib/stores/chat-store";
import { useApiKeysStore } from "@/lib/stores/api-keys-store";
import { useSettingsStore } from "@/lib/stores/settings-store";
import { providers, type ActiveModel } from "@/lib/providers";
import { getModelByKey } from "@/lib/providers/model-registry";
import { runRoundtable } from "@/lib/engine/deliberation";
import type { StreamCallbacks } from "@/lib/engine/types";
import { MessageSquare } from "lucide-react";

export function ChatView() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, addUserMessage, addRoundtableResult } = useChatStore();
  const roundtable = useRoundtableStore();
  const { selectedModels, providerAuth } = useApiKeysStore();
  const settings = useSettingsStore();

  const isRunning = roundtable.status !== "idle" && roundtable.status !== "complete" && roundtable.status !== "error";

  // Auto-scroll on new content
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, roundtable.currentResult, roundtable.status]);

  const getActiveModels = useCallback((): ActiveModel[] => {
    const activeModels: ActiveModel[] = [];
    for (const sm of selectedModels) {
      const auth = providerAuth[sm.providerId];
      if (!auth || auth.status !== "valid" || !auth.apiKey) continue;

      const provider = providers.find((p) => p.id === sm.providerId);
      if (!provider) continue;

      const model = provider.models.find((m) => m.id === sm.modelId);
      if (!model) continue;

      activeModels.push({
        providerId: sm.providerId,
        providerName: provider.name,
        modelId: model.id,
        modelName: model.name,
        apiKey: auth.apiKey,
        color: provider.color,
        capability: model.capability,
      });
    }
    return activeModels;
  }, [selectedModels, providerAuth]);

  const handleSubmit = async (message: string) => {
    addUserMessage(message);

    const activeModels = getActiveModels();
    if (activeModels.length < 2) return;

    const id = crypto.randomUUID();
    roundtable.initResult(id, message);

    // Initialize response slots for all models
    for (const model of activeModels) {
      roundtable.addRound1Response({
        providerId: model.providerId,
        providerName: model.providerName,
        modelId: model.modelId,
        modelName: model.modelName,
        color: model.color,
        text: "",
        isStreaming: true,
        isComplete: false,
      });
    }

    const callbacks: StreamCallbacks = {
      onRound1Start: () => roundtable.setStatus("round1"),
      onRound1Token: (providerId, modelId, token) => {
        roundtable.updateRound1Response(providerId, modelId, {
          text: (roundtable.currentResult?.round1.find((r) => r.providerId === providerId && r.modelId === modelId)?.text || "") + token,
        });
      },
      onRound1Complete: (providerId, modelId, text, inputTokens, outputTokens) => {
        roundtable.updateRound1Response(providerId, modelId, {
          text,
          isStreaming: false,
          isComplete: true,
          inputTokens,
          outputTokens,
        });
      },
      onRound1Error: (providerId, modelId, error) => {
        roundtable.updateRound1Response(providerId, modelId, {
          isStreaming: false,
          isComplete: true,
          error,
        });
      },

      onRound2Start: () => {
        roundtable.setStatus("round2");
        const r1Responses = roundtable.currentResult?.round1.filter((r) => r.isComplete && !r.error) || [];
        for (const r of r1Responses) {
          roundtable.addRound2Response({
            providerId: r.providerId,
            providerName: r.providerName,
            modelId: r.modelId,
            modelName: r.modelName,
            color: r.color,
            text: "",
            isStreaming: true,
            isComplete: false,
          });
        }
      },
      onRound2Token: (providerId, modelId, token) => {
        roundtable.updateRound2Response(providerId, modelId, {
          text: (roundtable.currentResult?.round2.find((r) => r.providerId === providerId && r.modelId === modelId)?.text || "") + token,
        });
      },
      onRound2Complete: (providerId, modelId, text, inputTokens, outputTokens) => {
        roundtable.updateRound2Response(providerId, modelId, {
          text,
          isStreaming: false,
          isComplete: true,
          inputTokens,
          outputTokens,
        });
      },
      onRound2Error: (providerId, modelId, error) => {
        roundtable.updateRound2Response(providerId, modelId, {
          isStreaming: false,
          isComplete: true,
          error,
        });
      },

      onRound2_5Start: () => {
        roundtable.setStatus("round2.5");
        const r2Responses = roundtable.currentResult?.round2.filter((r) => r.isComplete && !r.error) || [];
        for (const r of r2Responses) {
          roundtable.addRound2_5Response({
            providerId: r.providerId,
            providerName: r.providerName,
            modelId: r.modelId,
            modelName: r.modelName,
            color: r.color,
            text: "",
            isStreaming: true,
            isComplete: false,
          });
        }
      },
      onRound2_5Token: (providerId, modelId, token) => {
        roundtable.updateRound2_5Response(providerId, modelId, {
          text: (roundtable.currentResult?.round2_5?.find((r) => r.providerId === providerId && r.modelId === modelId)?.text || "") + token,
        });
      },
      onRound2_5Complete: (providerId, modelId, text, inputTokens, outputTokens) => {
        roundtable.updateRound2_5Response(providerId, modelId, {
          text,
          isStreaming: false,
          isComplete: true,
          inputTokens,
          outputTokens,
        });
      },
      onRound2_5Error: (providerId, modelId, error) => {
        roundtable.updateRound2_5Response(providerId, modelId, {
          isStreaming: false,
          isComplete: true,
          error,
        });
      },

      onRound3Start: () => {
        roundtable.setStatus("round3");
      },
      onRound3Token: (providerId, modelId, token) => {
        const current = roundtable.currentResult?.finalAnswer;
        if (!current) {
          const model = activeModels.find((m) => m.providerId === providerId && m.modelId === modelId);
          roundtable.setFinalAnswer({
            providerId,
            providerName: model?.providerName || providerId,
            modelId,
            modelName: model?.modelName || modelId,
            color: model?.color || "#888",
            text: token,
            isStreaming: true,
            isComplete: false,
          });
        } else {
          roundtable.updateFinalAnswer({ text: current.text + token });
        }
      },
      onRound3Complete: (providerId, modelId, text, inputTokens, outputTokens) => {
        const model = activeModels.find((m) => m.providerId === providerId && m.modelId === modelId);
        if (!roundtable.currentResult?.finalAnswer) {
          roundtable.setFinalAnswer({
            providerId,
            providerName: model?.providerName || providerId,
            modelId,
            modelName: model?.modelName || modelId,
            color: model?.color || "#888",
            text,
            isStreaming: false,
            isComplete: true,
            inputTokens,
            outputTokens,
          });
        } else {
          roundtable.updateFinalAnswer({
            text,
            isStreaming: false,
            isComplete: true,
            inputTokens,
            outputTokens,
          });
        }
      },
      onRound3Error: (_providerId, _modelId, error) => {
        roundtable.updateFinalAnswer({
          isStreaming: false,
          isComplete: true,
          error,
        });
      },

      onComplete: () => {
        roundtable.setStatus("complete");
        if (roundtable.currentResult) {
          addRoundtableResult(roundtable.currentResult);
        }
      },
      onError: (error) => {
        roundtable.setError(error);
      },
    };

    const modelSettingsMap: Record<string, { temperature: number; maxTokens: number; systemPrompt: string }> = {};
    for (const model of activeModels) {
      const key = `${model.providerId}:${model.modelId}`;
      modelSettingsMap[key] = settings.getModelSettings(key);
    }

    await runRoundtable(
      {
        prompt: message,
        models: activeModels,
        rounds: settings.deliberationRounds,
        mode: settings.deliberationMode,
        synthesizerModel: settings.synthesizerModel,
        modelSettings: modelSettingsMap,
      },
      callbacks
    );
  };

  const hasActiveModels = getActiveModels().length >= 2;
  const round1Complete = roundtable.currentResult?.round1.filter((r) => r.isComplete).length || 0;
  const round1Total = roundtable.currentResult?.round1.length || 0;
  const round2Complete = roundtable.currentResult?.round2.filter((r) => r.isComplete).length || 0;
  const round2Total = roundtable.currentResult?.round2.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !roundtable.currentResult && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 text-muted-foreground">
            <MessageSquare className="h-12 w-12 opacity-30" />
            <div>
              <h3 className="text-lg font-medium text-foreground mb-1">Ready to Deliberate</h3>
              <p className="text-sm max-w-md">
                Ask a question and {getActiveModels().length} AI models will independently respond,
                cross-examine each other, and synthesize a consensus answer.
              </p>
            </div>
          </div>
        )}

        {/* Past messages */}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-indigo-500/20 text-foreground rounded-2xl rounded-br-md px-4 py-2.5 max-w-2xl text-sm border border-indigo-500/10">
                  {msg.content}
                </div>
              </div>
            ) : msg.roundtableResult ? (
              <RoundtableResult result={msg.roundtableResult} />
            ) : null}
          </div>
        ))}

        {/* Active roundtable (in progress) */}
        {roundtable.currentResult && roundtable.status !== "complete" && roundtable.status !== "idle" && (
          <div className="space-y-3">
            {/* Progress */}
            <ProgressIndicator
              status={roundtable.status}
              round1Count={round1Complete}
              round1Total={round1Total}
              round2Count={round2Complete}
              round2Total={round2Total}
            />

            {/* Live Final Answer — shown first and prominently */}
            {roundtable.currentResult.finalAnswer && (
              <FinalAnswer response={roundtable.currentResult.finalAnswer} />
            )}

            {/* All rounds collapsed into "View Details" */}
            {roundtable.currentResult.round1.length > 0 && (
              <RoundSection
                title="View Details — Individual Model Responses"
                responses={[]}
                defaultOpen={false}
                roundGroups={[
                  ...(roundtable.currentResult.round1.length > 0 ? [{ title: "Round 1: Independent Answers", responses: roundtable.currentResult.round1, completedCount: round1Complete, totalCount: round1Total }] : []),
                  ...(roundtable.currentResult.round2.length > 0 ? [{ title: "Round 2: Cross-Examination", responses: roundtable.currentResult.round2, completedCount: round2Complete, totalCount: round2Total }] : []),
                  ...(roundtable.currentResult.round2_5 && roundtable.currentResult.round2_5.length > 0 ? [{ title: "Debate Round", responses: roundtable.currentResult.round2_5 }] : []),
                ]}
              />
            )}
          </div>
        )}

        {/* Error display */}
        {roundtable.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {roundtable.error}
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput onSubmit={handleSubmit} disabled={isRunning || !hasActiveModels} />
    </div>
  );
}
