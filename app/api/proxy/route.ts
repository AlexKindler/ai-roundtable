import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { auth } from "@/lib/auth";

const OPENAI_COMPATIBLE_PROVIDERS: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1",
  cohere: "https://api.cohere.com/compatibility/v1",
  perplexity: "https://api.perplexity.ai",
  xai: "https://api.x.ai/v1",
  deepseek: "https://api.deepseek.com",
  openrouter: "https://openrouter.ai/api/v1",
};

// Extract HTTP status from various AI SDK error shapes
function getUpstreamStatus(error: unknown): number | undefined {
  if (typeof error !== "object" || error === null) return undefined;
  const e = error as Record<string, unknown>;
  // AI SDK APICallError uses statusCode; some use status; data.error may contain status
  for (const key of ["statusCode", "status"]) {
    if (typeof e[key] === "number") return e[key] as number;
  }
  // Some errors nest inside a data or cause property
  if (typeof e.cause === "object" && e.cause !== null) {
    return getUpstreamStatus(e.cause);
  }
  return undefined;
}

// Check if error message suggests an auth failure
function looksLikeAuthError(message: string): boolean {
  const patterns = [
    "invalid.*api.?key",
    "invalid.*key",
    "incorrect.*api.?key",
    "authentication",
    "unauthorized",
    "forbidden",
    "permission denied",
    "invalid x-api-key",
    "invalid_api_key",
  ];
  const lower = message.toLowerCase();
  return patterns.some((p) => new RegExp(p).test(lower));
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    // Use 403 so it's distinguishable from a 401 "invalid API key" from upstream
    return Response.json(
      { error: "Please sign in to validate API keys.", code: "session_required" },
      { status: 403 }
    );
  }

  const { provider, apiKey, body } = await req.json();

  try {
    let languageModel;

    if (provider === "openai") {
      const openai = createOpenAI({ apiKey });
      languageModel = openai(body.model);
    } else if (provider === "anthropic") {
      const anthropic = createAnthropic({ apiKey });
      languageModel = anthropic(body.model);
    } else if (provider === "google") {
      const google = createGoogleGenerativeAI({ apiKey });
      languageModel = google(body.model);
    } else if (provider === "mistral") {
      const mistral = createMistral({ apiKey });
      languageModel = mistral(body.model);
    } else if (OPENAI_COMPATIBLE_PROVIDERS[provider]) {
      const openaiCompat = createOpenAI({
        apiKey,
        baseURL: OPENAI_COMPATIBLE_PROVIDERS[provider],
      });
      languageModel = openaiCompat(body.model);
    } else {
      return Response.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    await generateText({
      model: languageModel,
      messages: body.messages,
      maxOutputTokens: Math.max(body.max_tokens ?? 16, 16),
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const statusCode = getUpstreamStatus(error);

    // Definite auth failure from upstream provider
    if (statusCode === 401 || statusCode === 403 || looksLikeAuthError(message)) {
      return Response.json({ error: message, code: "invalid_key" }, { status: 401 });
    }

    // Everything else: model not found, rate limit, server error, etc.
    return Response.json({ error: message, code: "upstream_error" }, { status: 502 });
  }
}
