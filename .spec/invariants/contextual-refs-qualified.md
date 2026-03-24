---
type: invariant
name: Contextual Refs Qualified
id: contextual-refs-qualified
context: lore
links:
  - edge: constrains
    target: term:primitive
  - edge: depends-on
    target: term:bounded-context
tags: [core, v0.2]
---

**Condition:** A primitive with a non-empty `context` must always be referenced using the context-qualified form `context.prefix:slug`. The short form `prefix:slug` is reserved for shared primitives with no context.

**Examples:**
- Valid: `term:money`, `term:timestamp`, `billing.term:status`
- Invalid: `term:status` when the referenced primitive is `billing.term:status`

**Violation means:** Any CLI command that resolves primitive refs treats a short ref as matching only shared primitives. A contextual primitive ref without its `context.` prefix does not resolve.
