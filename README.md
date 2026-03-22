# Living Spec

Drop-in knowledge base that tells your LLM what's true about your project before it writes code.

## Quick start

Copy the `living-spec/` folder into your project root:

```bash
cp -r living-spec/ your-project/living-spec/
```

Add this to your AGENTS.md, CLAUDE.md, or cursor rules:

```markdown
## Living Spec

This project uses a living spec — a structured knowledge base in `living-spec/`.

Before implementing any feature:
1. Read `living-spec/.spec/SPEC.md` for the full meta-model and instructions
2. Read `living-spec/.spec/INDEX.md` for the current graph of all defined primitives
3. Identify the Feature you're implementing and traverse its dependencies
4. If any referenced primitive is missing or incomplete — stop and ask, do not guess

When you discover domain knowledge that isn't captured in the spec, propose a new
primitive to the user. Write it only after confirmation. Always update INDEX.md
when adding or changing primitives.
```

The spec starts empty and grows as you build. No upfront population needed.

## What's inside

```
living-spec/
├── .spec/
│   ├── SPEC.md              # Meta-model + LLM instructions (the seed file)
│   ├── INDEX.md             # Flat graph topology for quick lookup
│   └── templates/           # One template per primitive type
├── terms/                   # Domain concepts
├── invariants/              # Rules that must never break
├── rules/                   # Configurable business policies
├── events/                  # Domain events (past-tense facts)
├── flows/                   # Ordered processes
├── contracts/               # External system interfaces
├── decisions/               # Design choices with rationale
└── features/                # Named capabilities (entry points)
```

## How it works

8 typed primitives and 6 typed edges form a knowledge graph:

**Primitives:** Term, Invariant, Rule, Event, Flow, Contract, Decision, Feature

**Edges:** depends-on, constrains, includes, maps-to, emits, triggers

Each primitive is a markdown file with YAML frontmatter. The frontmatter carries the type, id, links to other primitives, and context. The body is free prose.

The LLM reads the spec before coding, traverses the graph to check it has everything it needs, and stops to ask when something is missing. Gaps get filled as you build — no upfront population needed.

Full details in [living-spec/.spec/SPEC.md](living-spec/.spec/SPEC.md).

## License

MIT
