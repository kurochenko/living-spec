---
type: feature
name: CLI Rename
id: cli-rename
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: inv:unique-primitive-id
  - edge: includes
    target: flow:rename-primitive
  - edge: includes
    target: dec:index-rebuild-on-write
tags: [cli, v0.2]
---

**Summary:** The `lore rename <old-ref> <new-slug>` command. Renames a primitive's slug, updates its file, rewrites all inbound link targets, and rebuilds INDEX.md.

**Acceptance criteria:**
- `lore rename term:old new` renames file, updates id, rewrites inbound refs
- Inbound link targets across all primitives are updated
- Duplicate slug within same type → exit with error
- Invalid new slug → exit with error
- Nonexistent primitive → exit with error
- Unqualified ref → exit with error
- INDEX.md is rebuilt

**Open questions:**
- None
