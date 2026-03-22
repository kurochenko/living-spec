---
type: invariant
name: Unique Primitive ID
id: unique-primitive-id
context: lore
links:
  - edge: constrains
    target: term:primitive
tags: [core]
---

**Condition:** Every primitive id (slug) must be unique within its type. Two different types can share the same slug (e.g., `term:auth` and `flow:auth` can coexist). All cross-references use qualified form `prefix:slug` to avoid ambiguity.

**Violation means:** `lore add` exits with an error showing the path of the existing primitive: `Primitive 'prefix:slug' already exists at {path}.`
