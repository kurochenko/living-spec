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
1. **Sync:** Frontmatter links and prose `[[...]]` mentions must be identical sets — every link has a prose mention, every prose mention has a link
2. **Validity:** Every `[[...]]` target must reference an existing primitive in the spec

**On violation:** `lore check` reports errors:
- "Primitive 'billing.term:status' is linked in frontmatter but not mentioned in prose with `[[billing.term:status]]`. Either remove the link or add `[[billing.term:status]]` to the prose."
- "Primitive `[[billing.term:status]]` referenced in prose but not linked in frontmatter. Add to links."
- "Primitive `[[nonexistent.term:foo]]` referenced in prose but no such primitive exists."