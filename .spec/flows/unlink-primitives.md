---
type: flow
name: Unlink Primitives
id: unlink-primitives
links:
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
---

**Trigger:** User runs `lore unlink <source> <edge> <target>`

**Inputs:**
- `<source>` (required) — qualified ref of the source [[term:primitive]] (prefix:slug)
- `<edge>` (required) — one of the six edge types
- `<target>` (required) — qualified ref of the target [[term:primitive]] (prefix:slug)

**Steps:**
1. Parse source ref → exit with error if not qualified form
2. Parse target ref → exit with error if not qualified form
3. Validate edge is one of the six allowed types → exit with error if not
4. Find project root (walk up for `.spec/SPEC.md`)
5. Look up source primitive → exit with error if not found
6. Look up target primitive → exit with error if not found
7. Find matching link in source's links array (same edge + same target) → exit with error if not found
8. Remove the matching link entry from source's frontmatter links array
9. Write source file back
10. Rebuild INDEX.md according to [[dec:index-rebuild-on-write]]
11. Print confirmation: `Unlinked source → edge → target`

**Outputs:**
- Updated source primitive file with link removed
- Updated INDEX.md

**Error paths:**
- Unqualified source → exit with "Use qualified form prefix:slug."
- Unqualified target → exit with "Use qualified form prefix:slug."
- Invalid edge type → exit with error listing valid edge types
- Source not found → exit with "Source 'prefix:slug' not found."
- Target not found → exit with "Target 'prefix:slug' not found."
- Link not found → exit with "No link found: source → edge → target."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
