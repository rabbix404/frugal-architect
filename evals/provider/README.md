# `evals/provider/openai-compatible.mjs`

A ~50-line promptfoo provider that talks to any OpenAI-compatible
`/chat/completions` endpoint. Plain OpenAI is the default; the notes below
explain why a hand-rolled adapter exists instead of promptfoo's built-in one.

## Why this file exists

The suite needs to run on a cheap, OpenAI-compatible lane. promptfoo's built-in
`openai:*` providers were not usable for it, for two independent reasons:

1. **Base URL was ignored.** `config.apiBaseUrl` was dropped and requests went
   to `api.openai.com`, returning `401 Incorrect API key`. Setting
   `OPENAI_BASE_URL` fixes routing but is process-global.
2. **Custom headers were dropped.** Some gateways require an extra session
   header and reject requests without it. `config.headers` was not forwarded on
   that path, so the provider sends it itself when `FRUGAL_EVAL_SESSION` is set.

Neither is fixable from `evals/promptfooconfig.yaml`, so the provider makes the HTTP
call itself: it sets the base URL and headers explicitly and returns the shape
promptfoo expects.

## What it does

- Parses promptfoo's rendered prompt. If it is a JSON array of
  `{role, content}` messages (the chat-array format used by `prompts/*.json`),
  it is sent as-is; otherwise the string is wrapped as a single `user` message.
  The second branch matters because `llm-rubric` graders send plain strings.
- `POST {BASE_URL}/chat/completions` with `model`, `messages`, a bearer key and
  the session header.
- Returns `{ output, tokenUsage: {prompt, completion, total} }`, or
  `{ error }` on non-2xx so a failed row is reported as an eval error rather
  than a silent pass.

## Where it is wired in

```yaml
providers:
  - id: file://./provider/openai-compatible.mjs
    label: muse-spark-1.3-contributor

defaultTest:
  options:
    provider: file://./provider/openai-compatible.mjs
```

The second reference is not optional: `llm-rubric` defaults its judge to
`openai:gpt-*` and will fail with "API key is not set" unless pointed at a
provider explicitly. Pointing both at this file keeps the candidate and the
judge on one lane, one billing path, no OpenAI account required.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `OPENAI_API_KEY` | — | Credential (or `FRUGAL_EVAL_API_KEY`) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Endpoint base URL (or `FRUGAL_EVAL_BASE_URL`) |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | Any OpenAI-compatible base URL (or `FRUGAL_EVAL_BASE_URL`) |
| `FRUGAL_EVAL_BASE_URL` | — | Same, wins over `OPENAI_BASE_URL` |
| `FRUGAL_EVAL_MODEL` | `muse-spark-1.3-contributor` | Model id sent to the lane |
| `FRUGAL_EVAL_SESSION` | — (unset) | If set, sent as the `x-opencode-session` header for gateways that require one |

Defaults are the maintainer's lane so the committed `evals/results.json` is
reproducible. They are not a recommendation and not a secret — override all
three to run on your own endpoint.

## What it deliberately does not do

- No retries or backoff on 429/5xx (a limited lane reports the row as an error).
- No streaming, tool calls, or JSON-mode — the suite only needs text out.
- No cost calculation; promptfoo reports token counts, not dollars.
