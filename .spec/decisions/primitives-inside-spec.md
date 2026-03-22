---
type: decision
name: Primitives Inside Spec
id: primitives-inside-spec
context: lore
links:
  - edge: depends-on
    target: term:spec-root
tags: [core]
---

**Context:** Primitive folders (terms/, invariants/, etc.) need to live somewhere in the project.

**Decision:** All primitive folders live inside `.spec/`, not at the project root.

**Alternatives considered:**
- Primitive folders at project root — adds eight folders to root, clutters the project
- Nested under a `living-spec/` subfolder — extra nesting, unfamiliar convention

**Consequences:** One folder (`.spec/`) contains everything. Clean project root. Easy to gitignore or move. The tradeoff is slightly longer paths (`.spec/terms/ltv.md` vs `terms/ltv.md`).
