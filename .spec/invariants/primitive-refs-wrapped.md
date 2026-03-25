---
type: invariant
name: Primitive Refs Wrapped
id: primitive-refs-wrapped
links:
  - edge: constrains
    target: 'term:primitive'
tags:
  - core
  - v0.2
---

**Condition:** [[term:primitive]] references that participate in the prose/frontmatter link contract must use the `[[...]]` wrapper syntax, where `...` is a valid primitive ref (`prefix:slug` or `context.prefix:slug`).

**Syntax:** `\[\[term:primitive\]\]` — the double brackets `[[` and `]]` are literal delimiters; the inside is the qualified ID.

**Examples:**
- Valid: `\[\[term:primitive\]\]`, `\[\[feat:cli-add\]\]`, `\[\[flow:check-completeness\]\]`
- Invalid: `term:primitive` (bare, no wrapper), `\[\[lore\]\]` (missing type prefix)

**Note on examples in spec documentation:** When showing `[[...]]` syntax as an example in spec prose, escape the brackets so the validator does not treat the example as a live reference: use `\[\[prefix:slug\]\]`.

**Violation means:** `lore check` reports an error when the resolved wrapped-ref set and resolved frontmatter-link set differ. Bare primitive-ref occurrences are also surfaced as warnings for review.
