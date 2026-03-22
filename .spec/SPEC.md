# Living System Specification

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

The spec is composed of typed files. Each file has YAML frontmatter (the structured part) and a markdown body (the prose part). One file per primitive, stored in the corresponding folder.

| Type | Folder | What it captures |
|---|---|---|
| **Term** | `terms/` | A named domain concept with an unambiguous definition scoped to one bounded context. Everything else references Terms. Entities, value objects, aggregates, roles, statuses, metrics — if it needs a shared meaning, it is a Term. |
| **Invariant** | `invariants/` | A condition that must hold true at all times with zero exceptions. Violating an invariant is a defect. Invariants are never configurable. |
| **Rule** | `rules/` | A configurable business policy. Unlike invariants, rules can change through configuration. Violating a rule is a business rejection, not a bug. |
| **Event** | `events/` | A named occurrence that has already happened. Always past tense. Events connect Flows — one Flow emits an Event, another is triggered by it. |
| **Flow** | `flows/` | An ordered sequence of steps achieving a domain outcome. Flows declare inputs, referenced Terms, respected Invariants/Rules, and emitted Events. The unit of behavior. |
| **Contract** | `contracts/` | An interface boundary with an external system. Declares: what we send, what we receive, field mappings to our Terms, and failure modes. |
| **Decision** | `decisions/` | A design choice with context, rationale, alternatives considered, and consequences. |
| **Feature** | `features/` | A named capability that declares which primitives it requires. The entry point for implementation and completeness checking. |

### Edges

Six typed, directional relationships. Declared in the `links` section of each file's frontmatter.

| Edge | Direction | Meaning |
|---|---|---|
| **depends-on** | any → any | X cannot be defined or function correctly without Y. The primary edge for impact analysis and completeness checking. |
| **constrains** | Invariant\|Rule → Term\|Flow | X imposes a restriction on Y. The implementation of Y must respect X. |
| **includes** | Feature → any; Term → Term | X has Y as a constituent part. Features declare their primitives; composite Terms declare sub-terms. |
| **maps-to** | Term → Term; Contract → Term | X in one context/system corresponds to Y in another. Used at bounded context boundaries and external system interfaces. |
| **emits** | Flow → Event | X produces Y as a result of execution. |
| **triggers** | Event → Flow; Event → Event | X causes Y to begin. |

### Bounded Context

Not a primitive. Every file carries a `context` field in frontmatter — the bounded context it belongs to. Filter by context, don't traverse to it.

---

## File Format

Every primitive file follows this structure:

```yaml
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
```

### Deprecation

There is no status lifecycle. A primitive file exists or it doesn't. If it exists, it's active.

The only flag is `deprecated: true` — a soft delete. It means: this primitive is no longer relevant for new work, but the file stays because other primitives may still link to it and git history references it. The LLM skips deprecated primitives during completeness checks and does not use them for new implementations.

Do not delete primitive files. Deprecate them instead. Deleting breaks link references.

### Naming conventions

- **id** (slug): kebab-case, unique within its type. E.g., `ltv`, `loan-approved`, `max-residential-ltv`
- **qualified id**: `prefix:slug`. Each type has a short prefix: `term`, `inv`, `rule`, `evt`, `flow`, `con`, `dec`, `feat`. E.g., `term:ltv`, `evt:loan-approved`, `rule:max-residential-ltv`
- **type input**: CLI commands that accept a type accept both the full name (`feature`) and the prefix (`feat`). Frontmatter always stores the full name — prefix resolution is input-only.
- **filename**: `{slug}.md` inside the type folder. E.g., `.spec/terms/ltv.md`, `.spec/events/loan-approved.md`
- **target** in links: always the qualified id of the target primitive. E.g., `target: term:ltv`

---

## How to Use This Spec (LLM Instructions)

### Before implementing a feature

```
1. Read the Feature file for the capability you're implementing
2. Collect: all primitives the Feature includes
3. For each included primitive:
   a. Read the file
   b. Recursively collect its depends-on targets
   c. Collect all Invariants/Rules that constrains it
   d. For Flows: collect emits targets; for Events: collect triggers targets
4. Build the full set of primitives in scope
5. Check: does every referenced id have a corresponding file?
   - YES → you have a complete subgraph. Proceed to implement.
   - NO  → you have gaps. List them and ask the user before writing code.
```

### When you find a gap

A gap is any situation where:
- A `links.target` references an id that has no file
- A Flow references a Term that isn't defined
- An Invariant constrains something, but the constraint parameters are unclear
- You need domain knowledge that isn't captured anywhere in the spec

When you find a gap:
1. **Stop.** Do not guess or infer.
2. Tell the user exactly what's missing and why you need it.
3. Propose a primitive — suggest the type, name, id, and what you think the definition might be.
4. Wait for the user to confirm or correct.
5. Write the file only after confirmation.

### When you propose a spec update

If you discover during implementation that:
- A Term needs a clarified definition
- An Invariant is missing
- A Rule's parameters aren't captured
- A Flow has steps that aren't documented

Then:
1. Finish the immediate coding task if you have enough to proceed safely
2. Propose the update as a specific diff: "I'd add Invariant X with these links because..."
3. Wait for user confirmation before writing to the spec
4. Write the primitive file after confirmation

### When starting with an existing project (brownfield)

If you're plugging this spec into a project that already has code:
1. Do NOT try to reverse-engineer the entire domain at once
2. Start with the Feature you're currently working on
3. Define only the primitives that Feature needs
4. As you work on more features, the spec grows naturally
5. Each session should leave the spec slightly more complete than it found it

### Deriving tests from the spec

Four primitive types are testable — their files tell you exactly what to test:

**Invariants** → unit tests. The file declares a condition and a violation outcome. Write one test asserting the condition holds and one asserting the violation path behaves correctly.

**Rules** → unit tests. Same as invariants, but rules are parameterized. Test the default behavior and boundary values of each parameter.

**Flows** → happy path + error path tests. The file lists steps (the happy path) and error paths (the edge cases). Each step is a test assertion, each error path is a test case.

**Contracts** → integration or contract tests. The file declares what we send, what we receive, and failure modes. Test that the shape matches and failures are handled.

Four types produce no dedicated tests:

**Terms** — definitions, nothing to execute. **Decisions** — rationale, tested implicitly through the code they shaped. **Events** — tested through the flows that emit and trigger them. **Features** — rollups, tested by testing their constituent primitives.

When implementing a feature, collect its invariants, rules, flows, and contracts. These are your test cases.

### Querying the spec

Three query patterns:

**Direct lookup** — "What is LTV?" → `lore show term:ltv` or read `.spec/terms/ltv.md`

**Impact analysis** — "What breaks if I change LTV calculation?"
→ Find all primitives where `links.target == "term:ltv"`. These are everything that depends-on, constrains, includes, or maps-to LTV. Recursively follow outward. Or: `lore show term:ltv --related`

**Completeness check** — "Do I have everything for Loan Origination?"
→ Start from `features/loan-origination.md`, traverse all `includes`, recursively resolve all `depends-on`, check for dead references.

---

## Index

The file `.spec/INDEX.md` is an auto-maintained flat list of all primitives and their links. It exists so that a single file read gives you the full graph topology without opening every file. It is rebuilt automatically by the lore CLI on every write command.

---

## Principles

1. **Minimal but complete.** Don't define what you don't need yet. But what you define must be complete enough to implement against without guessing.
2. **The spec grows through use.** Don't populate it proactively. Let implementation pressure reveal what's needed.
3. **Invariants over comments.** If a rule must always hold, put it in an Invariant file — not in a code comment. Code comments get stale. The spec is the source of truth.
4. **One qualified id, one file, one meaning.** No ambiguity. IDs are unique per type, qualified with a prefix (`term:ltv`, `flow:originate-loan`). If two contexts use the same word differently, they are two Terms with a `maps-to` edge.
5. **The graph is the value.** Prose definitions are necessary but not sufficient. The links between primitives are what enable impact analysis, completeness checking, and gap detection.
6. **Exists means active.** No status lifecycle. If a file is in the spec, it's live. If it's no longer relevant, mark it `deprecated: true`. That's the only flag.
