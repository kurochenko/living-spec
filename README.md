# Living Spec

Drop-in knowledge base that tells your LLM what's true about your project before it writes code.

## Why

Every project accumulates hidden knowledge — the invariants your team keeps in head, the decisions made in PRs that everyone forgets, the rules that "everyone knows" but nobody wrote down.

LLMs write code based on what they see in your codebase. If your rules live in Slack threads, Notion docs, or tribal knowledge, the LLM will miss them. It will implement features that contradict your invariants. It will "help" by making things up.

### A shared language both you and the LLM can reason about

Living Spec gives you a small vocabulary of **primitives** — Term, Invariant, Rule, Event, Flow, Contract, Decision, Feature — connected by typed **edges** (depends-on, constrains, includes, maps-to, emits, triggers).

Inspired by Domain-Driven Design, but flattened for LLM readability. Instead of Ubiquitous Language buried in prose, you get a traversable graph where every concept is explicit and linked.

**Term** captures what something *is* (e.g., `term:ltv` — a customer's lifetime value). **Invariant** captures what must *always* hold (`inv:ltv-never-negative`). **Rule** captures configurable policy. **Flow** shows how things proceed. **Feature** is the entry point. Edges connect them all.

### Design before you build

When you add a Feature, you trace its edges: what Terms does it use? What Invariants must hold? What Rules apply? What Flows does it touch? If any link is missing or vague — that's a gap. You fill it before coding, not during. This forces deliberate decomposition — you can't spec a feature you don't understand.

### The LLM checks its work — and writes the tests to prove it

Before implementing, the LLM reads the spec and traverses the graph. It can verify: does this feature's implementation respect `inv:ltv-never-negative`? Does it use `term:ltv` correctly in context? If something's missing or violated, it stops and asks — instead of shipping silently wrong code.

But it goes further: the LLM writes tests to *prove* invariants hold, rules are honored, flows behave correctly. Not just happy-path tests — it generates boundary cases from the spec's invariants and edge constraints. You get regression coverage "for free" because it was designed in.

### Cross-context smell detection

When a Feature touches multiple Flows, or a Term is used in contexts you didn't expect, the graph surfaces it. "Wait — `term:ltv` is being referenced from `flow:churn-analysis` and `flow:loan-origination`? Are those contexts compatible?" The spec makes implicit relationships visible before they become bugs.

## Installation

### One-liner (recommended)

```bash
curl -fsSL https://raw.githubusercontent.com/kurochenko/lore/master/install.sh | bash
```

This downloads the latest release from GitHub and installs globally via npm. Requires Node.js >= 20.

### From source

```bash
git clone https://github.com/kurochenko/lore.git
cd lore/cli
bun install
bun run build
lore init
```

## Quick start

Add this to your AGENTS.md, CLAUDE.md, or cursor rules:

```markdown
## Living Spec

This project uses a living spec — a structured knowledge base in `.spec/`.

Before implementing any feature:
1. Read `.spec/SPEC.md` for the full meta-model and instructions
2. Read `.spec/INDEX.md` for the current graph of all defined primitives
3. Identify the Feature you're implementing and traverse its dependencies
4. If any referenced primitive is missing or incomplete — stop and ask, do not guess

When you discover domain knowledge that isn't captured in the spec, propose a new
primitive to the user. Write it only after confirmation.
```

The spec starts empty and grows as you build. No upfront population needed.

## What's inside

```
.spec/
├── SPEC.md              # Meta-model + LLM instructions (the seed file)
├── INDEX.md             # Flat graph topology for quick lookup
├── templates/           # One template per primitive type
├── terms/               # Domain concepts
├── invariants/          # Rules that must never break
├── rules/               # Configurable business policies
├── events/              # Domain events (past-tense facts)
├── flows/               # Ordered processes
├── contracts/           # External system interfaces
├── decisions/           # Design choices with rationale
└── features/            # Named capabilities (entry points)
```

## How it works

8 typed primitives and 6 typed edges form a knowledge graph:

**Primitives:** Term, Invariant, Rule, Event, Flow, Contract, Decision, Feature

**Edges:** depends-on, constrains, includes, maps-to, emits, triggers

Each primitive is a markdown file with YAML frontmatter. The frontmatter carries the type, id, links to other primitives, and context. The body is free prose. Links use qualified IDs with type prefixes (`term:ltv`, `flow:originate-loan`, `dec:use-postgres`).

The LLM reads the spec before coding, traverses the graph to check it has everything it needs, and stops to ask when something is missing. Gaps get filled as you build — no upfront population needed.

Full details in [.spec/SPEC.md](.spec/SPEC.md).

## License

MIT
