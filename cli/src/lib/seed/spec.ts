export const specContent = `# Living System Specification

You are working with a **Living Spec** — a structured knowledge base that describes the domain, behavior, integrations, and design decisions of this project. Read this file completely before writing any code.

## Purpose

This spec is the precondition for coding, not a post-hoc artifact. Before implementing anything:

1. Identify which **Feature** you are working on
2. Traverse its graph to collect all referenced primitives
3. Run the completeness check (described below)
4. If there are gaps — **stop and ask** before writing code

---

## Meta-Model

### Primitives

The spec is composed of typed files. Each file has YAML frontmatter (the structured part) and a markdown body (the prose part). One file per primitive, stored in \`.spec/{type}s/\`.

| Type | Folder | What it captures |
|---|---|---|
| **Term** | \`.spec/terms/\` | A named domain concept with an unambiguous definition scoped to one bounded context. |
| **Invariant** | \`.spec/invariants/\` | A condition that must hold true at all times with zero exceptions. Violating an invariant is a defect. |
| **Rule** | \`.spec/rules/\` | A configurable business policy. Violating a rule is a business rejection, not a bug. |
| **Event** | \`.spec/events/\` | A named occurrence that has already happened. Always past tense. |
| **Flow** | \`.spec/flows/\` | An ordered sequence of steps achieving a domain outcome. The unit of behavior. |
| **Contract** | \`.spec/contracts/\` | An interface boundary with an external system. |
| **Decision** | \`.spec/decisions/\` | A design choice with context, rationale, alternatives considered, and consequences. |
| **Feature** | \`.spec/features/\` | A named capability that declares which primitives it requires. The entry point for completeness checking. |

### Edges

Six typed, directional relationships. Declared in the \`links\` section of each file's frontmatter.

| Edge | Direction | Meaning |
|---|---|---|
| **depends-on** | any → any | X cannot be defined or function correctly without Y. |
| **constrains** | Invariant\\|Rule → Term\\|Flow | X imposes a restriction on Y. |
| **includes** | Feature → any; Term → Term | X has Y as a constituent part. |
| **maps-to** | Term → Term; Contract → Term | X in one context/system corresponds to Y in another. |
| **emits** | Flow → Event | X produces Y as a result of execution. |
| **triggers** | Event → Flow; Event → Event | X causes Y to begin. |

### Bounded Context

Not a primitive. Every file carries a \`context\` field in frontmatter. Filter by context, don't traverse to it.

---

## File Format

\`\`\`yaml
---
type: term | invariant | rule | event | flow | contract | decision | feature
name: Human Readable Name
id: kebab-case-slug
context: bounded-context-name
deprecated: true  # optional — only add when marking a primitive as no longer relevant
links:
  - edge: depends-on | constrains | includes | maps-to | emits | triggers
    target: prefix:target-slug
tags: [optional, grouping, tags]
---

Prose body goes here. Free-form markdown.
\`\`\`

### Deprecation

There is no status lifecycle. If a file exists, it's active. The only flag is \`deprecated: true\` — a soft delete. Do not delete primitive files. Deprecate them instead.

### Naming conventions

- **id** (slug): kebab-case, unique within its type
- **qualified id**: \`prefix:slug\`. Prefixes: \`term\`, \`inv\`, \`rule\`, \`evt\`, \`flow\`, \`con\`, \`dec\`, \`feat\`
- **filename**: \`{slug}.md\` inside the type folder
- **target** in links: always the qualified id. E.g., \`target: term:ltv\`

---

## How to Use This Spec (LLM Instructions)

### Before implementing a feature

1. Read the Feature file for the capability you're implementing
2. Collect all primitives the Feature \`includes\`
3. Recursively collect \`depends-on\` targets, \`constrains\` sources, \`emits\`/\`triggers\` targets
4. Check: does every referenced id have a corresponding file?
   - YES → proceed to implement
   - NO → list gaps and ask the user before writing code

### When you find a gap

1. **Stop.** Do not guess or infer.
2. Tell the user exactly what's missing and why you need it.
3. Propose a primitive — suggest the type, name, id, and definition.
4. Wait for confirmation. Write the file only after.

### When starting with an existing project (brownfield)

1. Do NOT reverse-engineer the entire domain at once
2. Start with the Feature you're currently working on
3. Define only the primitives that Feature needs
4. The spec grows naturally through use

### Querying the spec

**Direct lookup** → \`lore show term:ltv\` or read \`.spec/terms/ltv.md\`

**Impact analysis** → Find all primitives where \`links.target == "term:ltv"\`. Recursively follow outward. Or: \`lore show term:ltv --related\`

**Completeness check** → Start from a Feature, traverse all \`includes\`, recursively resolve \`depends-on\`, check for dead references.

---

## Index

\`.spec/INDEX.md\` is an auto-maintained flat list of all primitives and their links. Rebuilt automatically by the lore CLI on every write command.

---

## Principles

1. **Minimal but complete.** Don't define what you don't need yet.
2. **The spec grows through use.** Let implementation pressure reveal what's needed.
3. **Invariants over comments.** The spec is the source of truth, not code comments.
4. **One qualified id, one file, one meaning.** No ambiguity. IDs are unique per type, qualified with a prefix.
5. **The graph is the value.** Links enable impact analysis and completeness checking.
6. **Exists means active.** No status lifecycle. \`deprecated: true\` is the only flag.
`
