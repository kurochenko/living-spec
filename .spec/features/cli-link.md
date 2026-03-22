---
type: feature
name: CLI Link
id: cli-link
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: inv:valid-edge-types
  - edge: includes
    target: flow:link-primitives
  - edge: includes
    target: flow:unlink-primitives
  - edge: includes
    target: dec:index-rebuild-on-write
tags: [cli, v0.2]
---

**Summary:** The `lore link` and `lore unlink` commands. Adds or removes typed edges between primitives, validates edge type constraints, and rebuilds INDEX.md.

**Acceptance criteria:**
- `lore link term:foo depends-on term:bar` adds a link entry to foo's frontmatter
- Duplicate link is rejected
- Invalid edge type is rejected with list of valid types
- Edge not allowed for source→target type pair is rejected
- Nonexistent source or target is rejected
- Unqualified refs are rejected
- `lore unlink term:foo depends-on term:bar` removes the matching link entry
- Unlink of nonexistent link is rejected
- INDEX.md is rebuilt after both link and unlink

**Open questions:**
- None
