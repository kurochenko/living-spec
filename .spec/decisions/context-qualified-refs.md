---
type: decision
name: Context-Qualified Refs
id: context-qualified-refs
context: lore
links:
  - edge: depends-on
    target: term:bounded-context
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: inv:unique-primitive-id
tags: [core]
---

**Context:**

When multiple bounded contexts define the same concept (e.g., billing has "status" and recipe has "status"), the current `prefix:slug` qualified ref is ambiguous. There is no structural way to disambiguate — context is metadata in frontmatter but not part of the identity.

**Decision:**

Context becomes the namespace in the qualified ref for contextual primitives: `context.prefix:slug`. The dot before the type prefix separates context from the rest. Since type prefixes are a fixed set (`term`, `inv`, `rule`, `evt`, `flow`, `con`, `dec`, `feat`), parsing is unambiguous — everything before the dot is context.

Key properties:

- **Uniqueness** changes from (type, slug) to (type, context, slug). `billing.term:status` and `recipe.term:status` can coexist.
- **Reference rule**: shared primitives with no context use the short form `prefix:slug`. Any primitive with a non-empty `context` must use the full `context.prefix:slug` form.
- **Storage is flat**: no subfolders. When context is present, the filename becomes `{context}.{slug}.md` (e.g., `.spec/terms/billing.status.md`). When there is no context, files stay as `{slug}.md`.
- **Frontmatter**: the `context` field remains the source of truth. The filename and qualified ref mirror it.
- **Shared/core concepts**: a primitive with no context is available to all contexts. Examples: `term:money`, `term:timestamp`.
- **Contexts are implicit**: created when the first primitive uses one. No upfront declaration needed.

**Cross-context edge conventions:**

Not all edge types are equal when crossing context boundaries. These conventions help detect design smells:

- `maps-to` crossing contexts → **healthy**. Explicit mapping between context-specific projections of the same real-world concept (e.g., `billing.term:customer` maps-to `crm.term:customer`).
- `triggers` crossing contexts → **healthy**. Event-driven integration. One context emits an event, another reacts. This is the clean integration seam.
- `depends-on` crossing contexts → **smell**. Tight coupling. Context A's internals depend on context B's internals. Consider introducing an event or contract at the boundary.
- `constrains` crossing contexts → **smell**. One context imposing rules on another. The constrained context should own its own invariants/rules.
- `includes` crossing contexts → **fine for features** (they are rollups that naturally span contexts), **smell for terms** (a term including a term from another context suggests a missing shared kernel).
- `emits` crossing contexts → **should not happen**. A flow and the events it emits should belong to the same context.

These conventions are not enforced by the CLI today but can be checked by `lore check` in the future (e.g., `lore check --context-map`).

**Alternatives considered:**

1. **Context-first folder nesting** (`.spec/billing/terms/status.md`): browsing by context is natural, but scatters the graph across directory trees, making cross-context queries harder. Rejected because the spec is meant to be queried by CLI/LLMs, not browsed by humans in a file tree.

2. **Type-first folder nesting** (`.spec/terms/billing/status.md`): same concept ("billing status") is split across type folders. Looking at "what's in billing" requires checking eight folders. Rejected.

3. **Slug convention** (`term:billing-status`): zero schema change but no enforcement. An LLM can't distinguish the context prefix from the slug. Rejected because context must be structural.

4. **Context as slash namespace** (`term:billing/status`): workable but the slash reads as "path" not "namespace", confusing both humans and LLMs. Rejected.

**Consequences:**

- All ref parsing must handle the optional `context.` prefix.
- `lore add` must accept `-c`/`--context` to set the context (it already does for frontmatter; now it also affects the filename).
- INDEX.md entries use the full form when context is present: `billing.term:status (billing) → ...`
- `lore list --context <name>` filters by context.
- Single-context projects still use short refs only for shared primitives; contextual primitives always carry their context prefix.
- The graph now contains enough information to detect cross-context coupling smells.
