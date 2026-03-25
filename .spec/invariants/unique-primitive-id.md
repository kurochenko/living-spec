---
type: invariant
name: Unique Primitive ID
id: unique-primitive-id
links:
  - edge: constrains
    target: 'term:primitive'
  - edge: depends-on
    target: 'term:bounded-context'
tags:
  - core
---

**Condition:** Every [[term:primitive]] id (slug) must be unique within its (type, context) pair. Two different types can share the same slug (e.g., `term:auth` and `flow:auth` can coexist). Two different contexts can share the same type and slug (e.g., `billing.term:status` and `recipe.term:status` can coexist). Shared primitives use `prefix:slug`; contextual primitives use `context.prefix:slug`.

**Reference rule:** The short form `prefix:slug` resolves only shared primitives with no context. A primitive with a non-empty `context` inside a [[term:bounded-context]] must be referenced as `context.prefix:slug`.

**Violation means:** `lore add` exits with an error showing the path of the existing primitive: `Primitive 'prefix:slug' already exists at {path}.`
