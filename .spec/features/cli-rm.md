---
type: feature
name: CLI Remove
id: cli-rm
links:
  - edge: includes
    target: 'term:primitive'
  - edge: includes
    target: 'term:index'
  - edge: includes
    target: 'flow:rm-primitive'
  - edge: includes
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
  - v0.2
---

**Summary:** The `lore rm <prefix:slug>` command. Deletes a [[term:primitive]] file, follows [[flow:rm-primitive]], checks for dangling references, and rebuilds [[term:index]] under [[dec:index-rebuild-on-write]].

**Acceptance criteria:**
- `lore rm term:foo` deletes `.spec/terms/foo.md` and rebuilds INDEX.md
- If other primitives link to `term:foo`, exit with error listing them (unless `--force`)
- `--force` skips reference check and deletes anyway
- Nonexistent primitive → exit with error
- Unqualified ref → exit with error
