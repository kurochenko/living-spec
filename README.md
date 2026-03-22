# Living Spec

Drop-in knowledge base that tells your LLM what's true about your project before it writes code.

## Quick start

Copy the `living-spec/` folder into your project root:

```bash
cp -r living-spec/ your-project/living-spec/
```

Point your LLM at the seed file — add this to your AGENTS.md, cursor rules, or equivalent:

```
Read living-spec/.spec/SPEC.md before implementing anything.
```

That's it. The spec starts empty and grows as you build.

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
