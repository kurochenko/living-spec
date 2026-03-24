---
type: rule
name: Link Prose Consistency
id: link-prose-consistency
context: lore
links:
  - edge: constrains
    target: term:primitive
  - edge: depends-on
    target: inv:primitive-refs-wrapped
tags: [v0.2]
---

**Policy:** Every primitive linked in frontmatter must be mentioned in prose with the [[...]] wrapper, and every [[...]] wrapper in prose must have a corresponding link in frontmatter.

**Consistency rules:**
1. **Sync:** Frontmatter links and prose `[[...]]` mentions must resolve to identical primitive sets — every link has a prose mention, every prose mention has a link
2. **Validity:** Every `[[...]]` target must resolve to exactly one existing primitive in the spec
3. **Frontmatter validity:** Every frontmatter link target must resolve to exactly one existing primitive in the spec

**On violation:** `lore check` reports errors:
- "Frontmatter link target `term:ghost` does not resolve to a primitive."
- "Primitive 'lore.term:primitive' is linked in frontmatter but not mentioned in prose with `[[lore.term:primitive]]`. Either remove the link or add `[[lore.term:primitive]]` to the prose."
- "Primitive `[[lore.term:primitive]]` referenced in prose but not linked in frontmatter. Add to links."
- "Primitive `[[lore.term:primitive]]` referenced in prose but no such primitive exists."
- "Primitive `[[term:status]]` referenced in prose but is ambiguous. Use the context-qualified form."
