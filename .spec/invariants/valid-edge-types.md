---
type: invariant
name: Valid Edge Types
id: valid-edge-types
context: lore
links:
  - edge: constrains
    target: term:primitive
tags: [core]
---

**Condition:** Every link added between two primitives must use an edge type that is valid for the source→target type pair. The allowed combinations are:

- **depends-on**: any → any
- **constrains**: invariant|rule → term|flow
- **includes**: feature → any; term → term
- **maps-to**: term → term; contract → term
- **emits**: flow → event
- **triggers**: event → flow; event → event

**Violation means:** `lore link` exits with an error: `Edge '{edge}' is not allowed from {sourceType} to {targetType}.`
