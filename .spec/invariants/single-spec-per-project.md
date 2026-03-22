---
type: invariant
name: Single Spec Per Project
id: single-spec-per-project
context: lore
links:
  - edge: constrains
    target: term:spec-root
tags: [core]
---

**Condition:** A directory can only have one `.spec/`. If `.spec/SPEC.md` already exists when `lore init` is run, the CLI prints `.spec/ already exists at {path}` and does nothing.

**Violation means:** Not applicable — this is a noop, not an error. The existing spec is left untouched.
