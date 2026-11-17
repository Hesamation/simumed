/** Minimal swappable LLM layer. One OpenAI-compatible `complete()` plus a
 *  small named-preset map — switching providers is an env change, not code.
 *
 *  Env:
 *    SIMUMED_LLM_PRESET  one of the presets below (default: avalai)
 *    SIMUMED_LLM_BASE_URL / SIMUMED_LLM_MODEL  optional overrides
 *    SIMUMED_LLM_API_KEY   required
 */

export interface ProviderPreset {
  baseUrl: string;
  model: string;
  /** Sent as `reasoning_effort` when the model reasons by default. */
  reasoningEffort?: string;
}

export const PRESETS: Record<string, ProviderPreset> = {
  avalai: {
    baseUrl: "https://api.avalai.ir/v1",
    model: "gpt-5-nano-2025-08-07",
    reasoningEffort: "minimal",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5-nano",
  },
  // Gemini's OpenAI-compatible endpoint; best-effort, verify before use.
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-3.1-flash-lite",
  },
};

export interface LlmConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  reasoningEffort?: string;
}

export function llmConfig(): LlmConfig | null {
  const preset =
    PRESETS[process.env.SIMUMED_LLM_PRESET?.trim() ?? ""] ?? PRESETS.avalai;
  const baseUrl = (
    process.env.SIMUMED_LLM_BASE_URL ?? preset.baseUrl
  ).trim();
  const model = (process.env.SIMUMED_LLM_MODEL ?? preset.model).trim();
  const apiKey = process.env.SIMUMED_LLM_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiKey,
    model,
    reasoningEffort: preset.reasoningEffort,
  };
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/** One chat completion. Returns the trimmed content, or null on any failure
 *  (the caller fails closed to the deterministic canonical reply). */
export async function complete(
  cfg: LlmConfig,
  messages: ChatMessage[],
  maxTokens: number,
  temperature = 0.2,
): Promise<string | null> {
  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature,
        max_tokens: maxTokens,
        // All callers parse JSON — force the contract so conversational
        // history can't tempt the model into free-text replies.
        response_format: { type: "json_object" },
        ...(cfg.reasoningEffort
          ? { reasoning_effort: cfg.reasoningEffort }
          : {}),
        messages,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const out = data.choices?.[0]?.message?.content?.trim();
    return out || null;
  } catch {
    return null;
  }
}
