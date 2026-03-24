---
type: invariant
name: Primitive Refs Wrapped
id: primitive-refs-wrapped
context: lore
links:
  - edge: constrains
    target: term:primitive
tags: [core, v0.2]
---

**Condition:** All primitive references in prose must use the `[[...]]` wrapper syntax where `...` is the qualified primitive ID (e.g., [[billing.term:status]]).

**Syntax:** `[[context.prefix:slug]]` — the double brackets `[[` and `]]` are literal delimiters; the inside is the qualified ID.

**Examples:**
- Valid: `[[term:ltv]]`, `[[billing.term:status]]`, `[[flow:submit-review]]`
- Invalid: `term:ltv` (bare, no wrapper), [[ltv]] (missing context/type prefix)

**Note on examples in spec documentation:** When showing `[[...]]` syntax as an example in spec prose (not as a real reference), wrap the entire `[[...]]` in backticks to prevent false validation: use `[[prefix:slug]]` not `[[prefix:slug]]`.

**Violation means:** `lore check` reports an error with the file path and line number of the unwrapped reference.