---
type: invariant
name: Unique Primitive ID
id: unique-primitive-id
context: lore
links:
  - edge: constrains
    target: term:primitive
  - edge: depends-on
    target: term:bounded-context
tags: [core]
---

**Condition:** Every primitive id (slug) must be unique within its (type, context) pair. Two different types can share the same slug (e.g., `term:auth` and `flow:auth` can coexist). Two different contexts can share the same type and slug (e.g., `billing.term:status` and `recipe.term:status` can coexist). All cross-references use qualified form `prefix:slug` (or `context.prefix:slug` when disambiguation is needed).

**Disambiguation rule:** If a slug is unique within its type across all contexts, the short form `prefix:slug` resolves unambiguously. If the same type+slug exists in multiple contexts, the CLI errors and requires the full `context.prefix:slug` form.

**Violation means:** `lore add` exits with an error showing the path of the existing primitive: `Primitive 'prefix:slug' already exists at {path}.`
