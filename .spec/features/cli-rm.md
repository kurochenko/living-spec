---
type: feature
name: CLI Remove
id: cli-rm
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: flow:rm-primitive
  - edge: includes
    target: dec:index-rebuild-on-write
tags: [cli, v0.2]
---

**Summary:** The `lore rm <prefix:slug>` command. Deletes a primitive file, checks for dangling references, and rebuilds INDEX.md.

**Acceptance criteria:**
- `lore rm term:foo` deletes `.spec/terms/foo.md` and rebuilds INDEX.md
- If other primitives link to `term:foo`, exit with error listing them (unless `--force`)
- `--force` skips reference check and deletes anyway
- Nonexistent primitive → exit with error
- Unqualified ref → exit with error
