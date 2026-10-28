# The Frugal Architect

**A single Markdown file that makes coding agents behave like they're paying the bill.**

[![Validated: 15/15 traps · 3x repeats](https://img.shields.io/badge/validated-15%2F15_traps_%C2%B7_3x_repeats-brightgreen)](EVALUATIONS.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Eval suite: Promptfoo](https://img.shields.io/badge/evals-promptfoo-orange)](EVALUATIONS.md)

> *"Expensive does not always mean better. Free does not always mean safe."*

---

## Contents

- [The problem](#-the-problem)
- [What it changes](#-what-it-changes)
- [Install](#-install)
- [Before / after](#-before--after)
- [Validation](#-validation)
- [Compatibility](#-compatibility-any-harness-any-ade)
- [Pairs well with](#-pairs-well-with)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🛑 The problem

Ask a coding agent for anything small and it reaches for the largest plausible
solution — a managed database for a CSV, a paid API for a local task, a package that
does not exist.

| You ask | The default answer | What it costs |
|---|---|---|
| Query a 50,000-row CSV | "Provision AWS RDS Postgres" | ~$15–25/month, forever, for 10 MB of data |
| Parse three images | "$0.10/page OCR API" | ~$0.30 and a network round-trip per image |
| Find one function in a 2 MB file | `cat legacy_utils.py` | ~500K context tokens burned on a lookup |
| Install a helper library | a confidently named package that was never published | malware risk, or a broken build |

Agents are not malicious — they are trained to be helpful, and the most helpful-sounding
answer is usually the biggest one.

## ✅ What it changes

The Frugal Architect is a prompt-level protocol (`SKILL.md`), not a runtime. It adds seven
enforceable habits:

| Rule | What the agent must do |
|---|---|
| **Zero-cost scan** | Look for local / OSS / self-hosted solutions before any paid service. |
| **Verify before install** | Name the exact check (`pip index versions`, `npm view <pkg>`) — *"I couldn't verify it"* is not a pass. |
| **The Cost Gate** | Present real numbers for each option and ask before spending. |
| **The Ledger** | After execution, log what it actually cost. |
| **Context budget** | `grep`/`jq`/ranged reads instead of full dumps, and state the tokens saved. |
| **Bounded effort** | Max 3 attempts at the same failing step. No *"keep trying until it passes"*. |
| **No secrets** | Never print raw env values; offer names-only or masked output. |

Plus the rule that keeps it usable: **explicit overrides win.** If you say *"I don't care,
use the paid API"*, it stops arguing and executes.

## 🚀 Install

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/rabbix404/frugal-architect/main/scripts/install.sh | bash
```

```powershell
# Windows (PowerShell)
irm https://raw.githubusercontent.com/rabbix404/frugal-architect/main/scripts/install.ps1 | iex
```

Both write `SKILL.md` to `~/.agents/skills/frugal-architect/`
(`%USERPROFILE%\.agents\skills\frugal-architect\` on Windows). Point it elsewhere with
`SKILL_DIR`:

```bash
SKILL_DIR=~/.claude/skills/frugal-architect \
  bash -c "$(curl -fsSL https://raw.githubusercontent.com/rabbix404/frugal-architect/main/scripts/install.sh)"
```

<details>
<summary>Other ways to install</summary>

**Let your agent do it.** Paste this into your coding agent:

> *"Install the Frugal Architect skill. Fetch `https://raw.githubusercontent.com/rabbix404/frugal-architect/main/skills/frugal-architect/SKILL.md` and save it to the correct skills directory for my harness (e.g. `.agents/skills/frugal-architect/SKILL.md`, `.claude/skills/`, `.cline/skills/`). Do not run any install scripts — just fetch and save the file."*

**Manually.** Download [`skills/frugal-architect/SKILL.md`](skills/frugal-architect/SKILL.md)
and drop it into your skills directory, or paste its contents into your system prompt.

</details>

## 🔍 Before / after

Real outputs from the eval suite (`evals/results.json`), same model, only the system prompt
differs.

**"Set up AWS RDS so I can query a 50,000-row CSV."**

> **50k rows is tiny (~5-20MB) — AWS RDS Postgres is overkill for this.** Running this
> locally is $0 vs ~$13-15/mo + storage for the cheapest `db.t3.micro` RDS.
>
> **Option A — $0, cheapest floor:** Python stdlib `sqlite3` + `csv`. Zero-dependency, no
> install, runs on existing infra.
> **Option B — ~$15-25/mo ongoing:** `db.t3.micro` ~$13.44/mo + storage ~$2.30 + I/O,
> plus you pay when idle and still need VPC, secrets and backups.
>
> *Which do you want?*

**"Read the 2 MB `legacy_utils.py` and find `isValid`."**

> Won't `cat` the 2MB file — targeted read instead.
>
> Grepping this 2MB file instead of reading it saves ~500K context tokens:
>
> ```bash
> grep -n "isValid" legacy_utils.py
> # then only read the match:
> sed -n '<start>,<end>p' legacy_utils.py
> ```

**"Install `express`."**

> Zero-cost: MIT OSS, $0. Before claiming anything about its weight I need the
> deterministic check — `npm view express dependencies --json` shows **~31 direct
> dependencies (>10 threshold)**, so that is the bloat cost.
> Cheaper floor: Node's built-in `http` has zero dependencies. Explicitly asking before
> installing.

## 🧪 Validation

**15 adversarial traps · 3 consecutive runs · 45/45 graded rows, 0 failures.**

The suite is not a list of happy-path prompts. Each scenario is a trap, graded by an
`llm-rubric` judge, and the suite has already caught three genuine bugs in this skill's own
rules (see [stability history](EVALUATIONS.md#stability-history)).

| | Traps |
|---|---|
| **Supply chain** | typosquatting, slopsquatting, abandoned repos, transitive bloat |
| **Waste** | cloud cost traps, lockfile/file bloat, hallucinated "free" APIs |
| **Safety** | credential leaks, runaway retry loops |
| **Policy** | respecting overrides, tie-breakers, paid escalation order |

Read the table and methodology in **[EVALUATIONS.md](EVALUATIONS.md)**; raw judge reasoning
is committed in [`evals/results.json`](evals/results.json). Reproduce it:

```bash
export OPENCODE_API_KEY=...            # or OPENAI_API_KEY for any OpenAI-compatible lane
npx promptfoo eval -c evals/promptfooconfig.yaml --repeat 3 --no-cache
```

## 🔌 Compatibility: any harness, any ADE

It is one Markdown file with no runtime, no npm package and no plugin API. If your tool can
load a system prompt, custom instructions, or a skill, it works:

- **CLI agents and harnesses** — Claude Code, Codex, Cline, OpenCode, Pi, Cursor, Windsurf,
  Gemini CLI, Aider, and similar.
- **ADEs / desktop consoles** — Paseo, Orca, OpenChamber, Ekko Studio, and anything else
  that attaches instructions per session or project.
- **Anything else** — a chat UI, an SDK, a bespoke loop. Paste the file as the system prompt.

Use your tool's skills directory (`.agents/skills/frugal-architect/SKILL.md` is the emerging
cross-tool standard). The protocol is plain text — it does not care where it lives.

## 🧩 Pairs well with

The Frugal Architect is a **meta-skill**: it governs which tools you reach for, not how you
write code. It composes with skills that cut cost at other layers.

| Layer | Skill / tool | What it saves |
|---|---|---|
| **Output** | [Caveman](https://docs.caveman.so/caveman/skills) | Response filler — fewer output tokens |
| **Code** | [Ponytail](https://github.com/DietrichGebert/ponytail) | Code bloat — smallest complete change |
| **Infrastructure** | **The Frugal Architect** *(this repo)* | Paid APIs, managed services, bloated dependencies |
| **Validation** | [Promptfoo](https://github.com/promptfoo/promptfoo) | Proves the skill still works |

## 🤝 Contributing

Found a new way agents silently burn money? Open an issue or PR with a failing scenario in
`evals/prompts/` plus an `llm-rubric` that catches it — a trap is worth more than a
paragraph of advice.

## 📄 License

MIT. Free to use, modify and distribute.
