---
type: flow
name: Reindex
id: reindex
links:
  - edge: depends-on
    target: 'term:index'
  - edge: depends-on
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
---

**Trigger:** User runs `lore reindex`

**Steps:**
1. Find project root (walk up for `.spec/SPEC.md`)
2. Rebuild [[term:index]] from all primitive files on disk according to [[dec:index-rebuild-on-write]]
3. Print confirmation: `INDEX.md rebuilt.`

**Outputs:**
- Updated INDEX.md reflecting current state of all primitive files

**Error paths:**
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
