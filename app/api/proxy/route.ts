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

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
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
      return new Response(`Unknown provider: ${provider}`, { status: 400 });
    }

    await generateText({
      model: languageModel,
      messages: body.messages,
      maxOutputTokens: body.max_tokens || 16,
    });

    return new Response("OK", { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Extract upstream status code from AI SDK errors
    const statusCode =
      (error as { status?: number })?.status ??
      (error as { statusCode?: number })?.statusCode;

    // Auth failures from upstream providers
    if (statusCode === 401 || statusCode === 403) {
      return Response.json({ error: message, code: "invalid_key" }, { status: 401 });
    }

    // Everything else is an upstream/transient error, not an invalid key
    return Response.json({ error: message, code: "upstream_error" }, { status: 502 });
  }
}
