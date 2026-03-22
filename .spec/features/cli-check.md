---
type: feature
name: CLI Check
id: cli-check
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: flow:check-completeness
  - edge: includes
    target: dec:bidirectional-subgraph-traversal
tags: [cli, v0.2]
---

**Summary:** The `lore check <prefix:slug>` command. Walks a primitive's dependency graph and reports missing (dead ref) or deprecated primitives.

**Acceptance criteria:**
- `lore check feat:my-feat` with all refs resolved → exit 0, prints complete message with count
- Dead ref (link target has no file) → exit 1, lists each missing ref with who references it
- Deprecated ref → exit 0, prints warning for each deprecated primitive
- Both dead + deprecated → exit 1 (dead refs take precedence)
- Works on any primitive, not just features
- Unqualified ref → exit with error
- Nonexistent primitive → exit with error

**Open questions:**
- None
