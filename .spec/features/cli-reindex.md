---
type: feature
name: CLI Reindex
id: cli-reindex
context: lore
links:
  - edge: includes
    target: term:index
  - edge: includes
    target: flow:reindex
  - edge: includes
    target: dec:index-rebuild-on-write
tags: [cli, v0.2]
---

**Summary:** The `lore reindex` command. Rebuilds INDEX.md from the current state of all primitive files on disk.

**Acceptance criteria:**
- `lore reindex` rebuilds INDEX.md
- Stale entries from deleted files are removed
- Newly added files (outside CLI) are picked up
- No `.spec/` → exit with error
