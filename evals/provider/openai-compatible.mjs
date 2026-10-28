// Thin adapter for any OpenAI-compatible inference lane.
//
// Why this exists: some gateways need headers that promptfoo's built-in OpenAI
// provider does not forward, so the call is made directly. Defaults to the plain
// OpenAI-compatible shape; nothing here is vendor specific.
//
// Overrides (all optional):
//   FRUGAL_EVAL_BASE_URL  | OPENAI_BASE_URL   default https://api.openai.com/v1
//   FRUGAL_EVAL_MODEL     | OPENAI_MODEL      default gpt-4o-mini
//   FRUGAL_EVAL_API_KEY   | OPENAI_API_KEY    required
//   FRUGAL_EVAL_SESSION                       optional extra header (some gateways)
const BASE_URL =
  process.env.FRUGAL_EVAL_BASE_URL ||
  process.env.OPENAI_BASE_URL ||
  'https://api.openai.com/v1';
const MODEL =
  process.env.FRUGAL_EVAL_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SESSION_HEADER = process.env.FRUGAL_EVAL_SESSION || '';

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

export default class OpenAICompatibleProvider {
  id() {
    return `openai-compatible:${MODEL}`;
  }

  async callApi(prompt, _context, _options) {
    const apiKey =
      process.env.FRUGAL_EVAL_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        error:
          'No API key: set OPENAI_API_KEY (or FRUGAL_EVAL_API_KEY) in your environment. ' +
          `Lane: ${BASE_URL}, model: ${MODEL}. See README for overrides.`,
      };
    }

    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    };
    if (SESSION_HEADER) headers['x-opencode-session'] = SESSION_HEADER;

    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers,
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
