# The Frugal Architect

> **"Expensive does not always mean better. Free does not always mean safe."**

[![Validated: 15/15 adversarial traps](https://img.shields.io/badge/validated-15%2F15_adversarial_traps-brightgreen)](EVALUATIONS.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **🛡️ Security First:** AI agents are increasingly being targeted by supply chain attacks (typosquatting, malicious plugins). This skill enforces package verification and explicit user approval before any `install` command is run.

A behavioral skill protocol for AI coding agents (Claude Code, Pi, Cline, OpenCode, etc.) that enforces a scarcity mindset. It transforms your agent from a "default-to-expensive" assistant into a resource-conscious senior engineer.

## 📖 The Manifesto

AI coding agents are trained to solve problems by reaching for the biggest, most expensive tool available. They will suggest a $0.10-per-page cloud API to parse a PDF, or spin up a managed database for a weekend side project. 

**The Frugal Architect** exists to fix that default.

This skill was built on a simple realization: **The cost of your context window is determined by your architecture, not just your model choice.** A highly optimized cache with a cheaper model can deliver the same quality as a frontier model with a broken cache, but at a fraction of the cost. 

When you force an agent to operate under a tight constraint, it stops being lazy. It starts looking for lighter, faster, open-source alternatives that deliver the exact same quality. It verifies the tools it uses, checks the benchmarks, and respects your budget.

**The Core Philosophy:**

1. **Scarcity Breeds Innovation:** When you have $50 instead of $5,000, you are forced to find smarter tools.
2. **The Validation Gap:** A trending GitHub repo is not a good tool. You must verify the project is active, unarchived, and its claims are real.
3. **Architecture > Expense:** You do not need a premium API to do great work. You need a smart setup and the right tools.

## 🛑 The Problem It Solves

AI agents are inherently lazy and default to the most expensive, managed, or complex option. 

If you ask an agent to "parse a PDF," it will immediately suggest a $0.10/page Cloud API and write the code to install it. Worse, it might hallucinate a package name (typosquatting), exposing your machine to supply chain malware. 

**The Frugal Architect** fixes this by enforcing three hard rules:

1. **Discover before you commit:** Always search for open-source, self-hostable, and free alternatives before considering paid services.
2. **Verify before you trust (Security First):** Prove the library exists, check the repo's health, and confirm it compiles. This prevents the agent from installing malware via hallucinated dependencies.
3. **Propose before you install:** Never silently modify the environment. Present the trade-offs (Time vs. Money) and wait for user approval.

## 🚀 Installation

### Option 1: One-liner (Recommended)

```bash
# macOS / Linux
curl -fsSL https://raw.githubusercontent.com/rabbix07/frugal-architect/main/install.sh | bash
```

```powershell
# Windows (PowerShell)
irm https://raw.githubusercontent.com/rabbix07/frugal-architect/main/install.ps1 | iex
```

Both scripts write `SKILL.md` to `~/.agents/skills/frugal-architect/` on macOS/Linux,
or `%USERPROFILE%\.agents\skills\frugal-architect\` on Windows. Override the target with `SKILL_DIR`:

```bash
SKILL_DIR=~/.claude/skills/frugal-architect bash install.sh
```

### Option 2: The "Magic Prompt"

Copy and paste this prompt to your AI coding agent (Claude Code, Pi, Cline, OpenCode, etc.):

> *"Install the Frugal Architect skill. Fetch the file from `https://raw.githubusercontent.com/rabbix07/frugal-architect/main/skills/frugal-architect/SKILL.md`. Detect which agent harness I am using and save the file to the correct skills directory (e.g., `.agents/skills/frugal-architect/SKILL.md`, `.claude/skills/`, or `.cline/skills/`). Do not run any install scripts; just fetch and save the markdown file."*

### Option 3: Manual Installation

1. Download `skills/frugal-architect/SKILL.md` from this repository.
2. Move it to your agent's skills directory. The universal cross-tool standard is `.agents/skills/frugal-architect/SKILL.md`.
3. If your harness uses a different path, see [Compatibility](#-compatibility-any-harness-any-ade) below.

## ✨ Key Features

* **The Zero-Cost Scan:** Forces the agent to evaluate local and OSS alternatives first.
* **The Trust Filter (Anti-Typosquatting):** Prevents the agent from hallucinating fake packages or recommending abandoned repos.
* **The Cost Gate:** Stops the agent from silently installing paid dependencies. It must present the trade-offs and ask for permission.
* **The Ledger Rule:** Even after approval, the agent must log the estimated or actual cost in its response.
* **The "Smart, Not Rich" Rule:** Prevents the agent from defaulting to expensive frontier models for trivial tasks, and warns against switching models mid-session (which destroys the prompt cache).
* **The Fallback Protocol:** If a free tool fails, the agent pivots to another free tool before escalating to a paid one.

## 🧩 Synergy: The Cost Defense System

The Frugal Architect is a **meta-skill**. It does not dictate how to write code; it dictates *what tools to use to write it*. It pairs perfectly with other community favorites to form a complete cost-defense system.

| Layer              | Skill / Tool             | What It Solves                                                             | Source / Link                                                                    |
|:------------------ |:------------------------ |:-------------------------------------------------------------------------- |:-------------------------------------------------------------------------------- |
| **Output**         | **Caveman**              | Reduces *response* token waste (speaking less, less filler).               | [docs.caveman.so](https://docs.caveman.so/caveman/skills)                        |
| **Code**           | **Ponytail**             | Reduces *code* bloat (YAGNI, smallest complete change).                    | [github.com/DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) |
| **Infrastructure** | **The Frugal Architect** | Reduces *tool and infrastructure* waste (paid APIs, bloated dependencies). | *(This Repo)*                                                                    |
| **Validation**     | **Promptfoo**            | Proves the skill actually works (automated LLM evals).                     | [github.com/promptfoo/promptfoo](https://github.com/promptfoo/promptfoo)         |

## 🧪 Validation & Testing (For Maintainers)

**Validated: 15/15 adversarial traps defeated.** See [EVALUATIONS.md](EVALUATIONS.md) for the
scenario table, the judge methodology, and the raw evidence in
[`evals/results.json`](evals/results.json).

The skill is validated against 15 adversarial scenarios (including context bloat, abandoned
repos, cloud cost traps, credential leaks, and transitive dependency hallucinations) using
autonomous LLM evals to ensure it doesn't regress into lazy behavior.

* **Promptfoo (Single-Turn Traps):** Tests the agent against hallucinated packages and silent installs. Run `npx promptfoo eval -c evals/promptfooconfig.yaml`.
* **Promptfoo (Multi-Turn Traps):** Tests the agent's behavior when the user overrides the Cost Gate (e.g., "I don't care, use the paid API") or when the user is indecisive.

### Running the suite locally

The fifteen scenarios (S1-S15) live in `evals/prompts/`, are graded by `llm-rubric`, and are configured in `evals/promptfooconfig.yaml`.

```bash
export OPENCODE_API_KEY=...        # or OPENAI_API_KEY for any OpenAI-compatible lane
npx promptfoo eval -c evals/promptfooconfig.yaml --no-cache -o evals/results.json
```

Any OpenAI-compatible endpoint works — override the defaults with `FRUGAL_EVAL_BASE_URL`, `FRUGAL_EVAL_MODEL`, and `FRUGAL_EVAL_SESSION` (see `evals/provider/opencode-go.mjs`). The committed `evals/results.json` is the last green run: 15/15 scenarios.

## 🔌 Compatibility: Any Harness, Any ADE

The Frugal Architect is a single Markdown file with no runtime, no npm package and no
plugin API. It works with **any** agent harness or ADE that can load a system prompt,
custom instructions, or a skill:

- **CLI agents and coding harnesses** — Claude Code, Codex, Cline, OpenCode, Pi, Cursor,
  Windsurf, Gemini CLI, Aider, and similar.
- **ADEs / desktop consoles** — Paseo, Orca, OpenChamber, Ekko Studio, and any other
  environment that lets you attach instructions per session or per project.
- **Anything else** — a chat UI, an SDK, a bespoke loop. Paste the file as the system
  prompt and the protocol applies.

**Where to put it.** Use your tool's skills or instructions directory
(`.agents/skills/frugal-architect/SKILL.md` is the emerging cross-tool standard). If your
harness has no skills concept, paste `SKILL.md` (or the contents of it) into the system
prompt / custom-instructions field. The protocol is plain text — it does not care where it
lives.

## 🤝 Contributing

This is a personal protocol built for the open-source community. If you find a new "trap" that agents fall into (e.g., a new way they silently spend money), please open an issue or submit a PR to add it to the eval suite.

## 📄 License

MIT License. Free to use, modify, and distribute.