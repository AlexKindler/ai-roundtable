import type { ActiveModel } from "@/lib/providers";
import type { DeliberationConfig, StreamCallbacks } from "./types";
import { buildCrossExamPrompt, buildDebatePrompt, buildSynthesisPrompt } from "./prompts";

interface LLMCallOptions {
  model: ActiveModel;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  temperature: number;
  maxTokens: number;
  onToken: (token: string) => void;
  onComplete: (text: string, inputTokens?: number, outputTokens?: number) => void;
  onError: (error: string) => void;
}

async function callLLM(options: LLMCallOptions): Promise<string> {
  const { model, messages, temperature, maxTokens, onToken, onComplete, onError } = options;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: model.providerId,
        apiKey: model.apiKey,
        model: model.modelId,
        messages,
        temperature,
        maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onToken(chunk);
    }

    onComplete(fullText);
    return fullText;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    onError(message);
    throw err;
  }
}

function selectSynthesizer(models: ActiveModel[], preferredId: string): ActiveModel {
  if (preferredId !== "auto") {
    const preferred = models.find((m) => m.providerId === preferredId);
    if (preferred) return preferred;
  }
  // Auto: pick highest capability
  return [...models].sort((a, b) => b.capability - a.capability)[0];
}

export async function runRoundtable(
  config: DeliberationConfig,
  callbacks: StreamCallbacks
): Promise<void> {
  const { prompt, models, mode, synthesizerModel, modelSettings } = config;

  if (models.length < 2) {
    callbacks.onError("At least 2 models are required for a roundtable.");
    return;
  }

  try {
    // ── Round 1: Independent Responses ──
    callbacks.onRound1Start();

    const round1Results = await Promise.allSettled(
      models.map((model) => {
        const settings = modelSettings[model.providerId] || {
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: "",
        };

        const messages: { role: "system" | "user"; content: string }[] = [];
        if (settings.systemPrompt) {
          messages.push({ role: "system", content: settings.systemPrompt });
        }
        messages.push({ role: "user", content: prompt });

        return callLLM({
          model,
          messages,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          onToken: (token) => callbacks.onRound1Token(model.providerId, token),
          onComplete: (text, inputTokens, outputTokens) =>
            callbacks.onRound1Complete(model.providerId, text, inputTokens, outputTokens),
          onError: (error) => callbacks.onRound1Error(model.providerId, error),
        });
      })
    );

    // Collect successful Round 1 responses
    const round1Responses: { model: ActiveModel; text: string }[] = [];
    round1Results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        round1Responses.push({ model: models[i], text: result.value });
      }
    });

    if (round1Responses.length < 2) {
      callbacks.onError("Not enough models responded in Round 1. Need at least 2.");
      return;
    }

    // ── Quick Mode: Skip to synthesis ──
    if (mode === "quick") {
      callbacks.onRound3Start();
      const synthesizer = selectSynthesizer(
        round1Responses.map((r) => r.model),
        synthesizerModel
      );

      const synthPrompt = buildSynthesisPrompt(
        prompt,
        round1Responses.map((r) => ({ name: r.model.providerName, text: r.text })),
        [] // No Round 2
      );

      await callLLM({
        model: synthesizer,
        messages: [{ role: "user", content: synthPrompt }],
        temperature: 0.5,
        maxTokens: 4096,
        onToken: (token) => callbacks.onRound3Token(synthesizer.providerId, token),
        onComplete: (text, inputTokens, outputTokens) =>
          callbacks.onRound3Complete(synthesizer.providerId, text, inputTokens, outputTokens),
        onError: (error) => callbacks.onRound3Error(synthesizer.providerId, error),
      });

      callbacks.onComplete();
      return;
    }

    // ── Round 2: Cross-Examination ──
    callbacks.onRound2Start();

    const respondingModels = round1Responses.map((r) => r.model);

    const round2Results = await Promise.allSettled(
      respondingModels.map((model, i) => {
        const otherResponses = round1Responses
          .filter((_, j) => j !== i)
          .map((r) => ({ name: r.model.providerName, text: r.text }));

        const crossExamPrompt = buildCrossExamPrompt(prompt, otherResponses);
        const settings = modelSettings[model.providerId] || {
          temperature: 0.7,
          maxTokens: 2048,
          systemPrompt: "",
        };

        return callLLM({
          model,
          messages: [{ role: "user", content: crossExamPrompt }],
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          onToken: (token) => callbacks.onRound2Token(model.providerId, token),
          onComplete: (text, inputTokens, outputTokens) =>
            callbacks.onRound2Complete(model.providerId, text, inputTokens, outputTokens),
          onError: (error) => callbacks.onRound2Error(model.providerId, error),
        });
      })
    );

    const round2Responses: { model: ActiveModel; text: string }[] = [];
    round2Results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        round2Responses.push({ model: respondingModels[i], text: result.value });
      }
    });

    // ── Round 2.5: Debate Mode ──
    let round2_5Responses: { model: ActiveModel; text: string }[] | undefined;

    if (mode === "debate") {
      callbacks.onRound2_5Start();

      const debateModels = round2Responses.map((r) => r.model);
      const debateResults = await Promise.allSettled(
        debateModels.map((model) => {
          const debatePrompt = buildDebatePrompt(
            prompt,
            round1Responses.map((r) => ({ name: r.model.providerName, text: r.text })),
            round2Responses.map((r) => ({ name: r.model.providerName, text: r.text }))
          );

          const settings = modelSettings[model.providerId] || {
            temperature: 0.7,
            maxTokens: 2048,
            systemPrompt: "",
          };

          return callLLM({
            model,
            messages: [{ role: "user", content: debatePrompt }],
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            onToken: (token) => callbacks.onRound2_5Token(model.providerId, token),
            onComplete: (text, inputTokens, outputTokens) =>
              callbacks.onRound2_5Complete(model.providerId, text, inputTokens, outputTokens),
            onError: (error) => callbacks.onRound2_5Error(model.providerId, error),
          });
        })
      );

      round2_5Responses = [];
      debateResults.forEach((result, i) => {
        if (result.status === "fulfilled") {
          round2_5Responses!.push({ model: debateModels[i], text: result.value });
        }
      });
    }

    // ── Round 3: Synthesis ──
    callbacks.onRound3Start();
    const allRespondingModels = round2Responses.length > 0
      ? round2Responses.map((r) => r.model)
      : round1Responses.map((r) => r.model);

    const synthesizer = selectSynthesizer(allRespondingModels, synthesizerModel);

    const synthPrompt = buildSynthesisPrompt(
      prompt,
      round1Responses.map((r) => ({ name: r.model.providerName, text: r.text })),
      round2Responses.map((r) => ({ name: r.model.providerName, text: r.text })),
      round2_5Responses?.map((r) => ({ name: r.model.providerName, text: r.text }))
    );

    await callLLM({
      model: synthesizer,
      messages: [{ role: "user", content: synthPrompt }],
      temperature: 0.5,
      maxTokens: 4096,
      onToken: (token) => callbacks.onRound3Token(synthesizer.providerId, token),
      onComplete: (text, inputTokens, outputTokens) =>
        callbacks.onRound3Complete(synthesizer.providerId, text, inputTokens, outputTokens),
      onError: (error) => callbacks.onRound3Error(synthesizer.providerId, error),
    });

    callbacks.onComplete();
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred";
    callbacks.onError(message);
  }
}
