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

**Condition:** Primitive references that participate in the prose/frontmatter link contract must use the `[[...]]` wrapper syntax, where `...` is a valid primitive ref (`prefix:slug` or `context.prefix:slug`).

**Syntax:** `[[lore.term:primitive]]` — the double brackets `[[` and `]]` are literal delimiters; the inside is the qualified ID.

**Examples:**
- Valid: `[[term:primitive]]`, `[[lore.feat:cli-add]]`, `[[lore.flow:check-completeness]]`
- Invalid: `term:primitive` (bare, no wrapper), `[[lore]]` (missing type prefix)

**Note on examples in spec documentation:** When showing `[[...]]` syntax as an example in spec prose (not as a real reference), wrap the entire `[[...]]` in backticks to prevent false validation: use `[[prefix:slug]]` not `[[prefix:slug]]`.

**Violation means:** `lore check` reports an error when the resolved wrapped-ref set and resolved frontmatter-link set differ. Bare primitive-ref occurrences are also surfaced as warnings for review.
