---
type: feature
name: CLI Deprecate
id: cli-deprecate
links:
  - edge: includes
    target: 'term:primitive'
  - edge: includes
    target: 'flow:deprecate-primitive'
  - edge: includes
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
  - v0.2
---

**Summary:** The `lore deprecate <prefix:slug>` command. Marks a [[term:primitive]] as deprecated by setting `deprecated: true` in frontmatter, follows [[flow:deprecate-primitive]], and rebuilds state under [[dec:index-rebuild-on-write]].

**Acceptance criteria:**
- `lore deprecate term:foo` sets `deprecated: true` and rebuilds INDEX.md
- Already deprecated → noop with message, exit 0
- Nonexistent primitive → exit with error
- Unqualified ref → exit with error
