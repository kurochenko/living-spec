---
type: feature
name: CLI Check
id: cli-check
links:
  - edge: includes
    target: 'term:primitive'
  - edge: includes
    target: 'term:index'
  - edge: includes
    target: 'flow:check-completeness'
  - edge: includes
    target: 'dec:bidirectional-subgraph-traversal'
tags:
  - cli
  - v0.2
---

**Summary:** The `lore check <prefix:slug>` command. Walks a [[term:primitive]] dependency graph through [[flow:check-completeness]], uses [[term:index]] to traverse related nodes, follows [[dec:bidirectional-subgraph-traversal]], and reports dead refs, deprecated refs, and prose/frontmatter consistency issues.

**Acceptance criteria:**
- `lore check feat:my-feat` with all refs resolved → exit 0, prints complete message with count
- Dead ref (link target has no file) → exit 1, lists each missing ref with who references it
- Deprecated ref → exit 0, prints warning for each deprecated primitive
- Both dead + deprecated → exit 1 (dead refs take precedence)
- Works on any primitive, not just features
- Unqualified ref → exit with error
- Nonexistent primitive → exit with error
- Frontmatter link missing a matching `\[\[wrapped-ref\]\]` in prose → exit 1
- `\[\[wrapped-ref\]\]` in prose missing a matching frontmatter link → exit 1
- Invalid `\[\[wrapped-ref\]\]` (no such primitive, or ambiguous short ref) → exit 1
- Frontmatter link target that does not resolve to a primitive → exit 1
- Bare primitive ref occurrence in prose → warning with file:line as a probable unlinked or unwrapped mention

**Open questions:**
- None
