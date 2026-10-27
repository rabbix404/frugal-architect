// Thin adapter for any OpenAI-compatible inference lane.
//
// Why this exists: promptfoo's built-in OpenAI providers do not forward their
// `config.headers` for this lane, and the opencode-go gateway rejects requests
// without an `x-opencode-session` header. So the call is made directly.
//
// Overridable so the suite runs on someone else's lane (see README):
//   FRUGAL_EVAL_BASE_URL, FRUGAL_EVAL_MODEL, FRUGAL_EVAL_SESSION
//   OPENCODE_API_KEY (falls back to OPENAI_API_KEY)
const BASE_URL = process.env.FRUGAL_EVAL_BASE_URL || 'https://opencode.ai/inference/go/v1';
const MODEL = process.env.FRUGAL_EVAL_MODEL || 'muse-spark-1.3-contributor';
const SESSION_HEADER = process.env.FRUGAL_EVAL_SESSION || 'pfo-frugal-suite';

function parseMessages(prompt) {
  const text = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.every((m) => m && typeof m.role === 'string')) {
      return parsed.map((m) => ({ role: m.role, content: m.content }));
    }
  } catch {
    // not a chat payload
  }
  return [{ role: 'user', content: text }];
}

export default class OpenCodeGoProvider {
  id() {
    return `opencode-go:${MODEL}`;
  }

  async callApi(prompt, _context, _options) {
    const apiKey = process.env.OPENCODE_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        error:
          'No API key: set OPENCODE_API_KEY (or OPENAI_API_KEY) in your environment. ' +
          `Lane: ${BASE_URL}, model: ${MODEL}. See README for overrides.`,
      };
    }

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
        'x-opencode-session': SESSION_HEADER,
      },
      body: JSON.stringify({ model: MODEL, messages: parseMessages(prompt) }),
    });

    const body = await res.text();
    if (!res.ok) {
      return { error: `API error ${res.status}: ${body.slice(0, 400)}` };
    }

    let data;
    try {
      data = JSON.parse(body);
    } catch {
      return { error: `Unparseable response: ${body.slice(0, 200)}` };
    }

    const output = data.choices?.[0]?.message?.content ?? '';
    const usage = data.usage ?? {};
    const promptTokens = usage.prompt_tokens ?? 0;
    const completionTokens = usage.completion_tokens ?? 0;

    return {
      output,
      tokenUsage: {
        prompt: promptTokens,
        completion: completionTokens,
        total: usage.total_tokens ?? promptTokens + completionTokens,
      },
      raw: data,
    };
  }
}
