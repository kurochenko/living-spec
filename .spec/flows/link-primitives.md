---
type: flow
name: Link Primitives
id: link-primitives
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: inv:valid-edge-types
  - edge: depends-on
    target: dec:index-rebuild-on-write
tags: [cli]
---

**Trigger:** User runs `lore link <source> <edge> <target>`

**Inputs:**
- `<source>` (required) — qualified ref of the source primitive (prefix:slug)
- `<edge>` (required) — one of the six edge types
- `<target>` (required) — qualified ref of the target primitive (prefix:slug)

**Steps:**
1. Parse source ref → exit with error if not qualified form
2. Parse target ref → exit with error if not qualified form
3. Validate edge is one of the six allowed types → exit with error if not
4. Find project root (walk up for `.spec/SPEC.md`)
5. Look up source primitive → exit with error if not found
6. Look up target primitive → exit with error if not found
7. Validate edge is allowed for source type → target type pair → exit with error if not
8. Check source's links array for duplicate (same edge + same target) → exit with error if duplicate
9. Append `{ edge, target: qualifiedTargetRef }` to source's frontmatter links array
10. Write source file back
11. Rebuild INDEX.md
12. Print confirmation: `Linked source → edge → target`

**Outputs:**
- Updated source primitive file with new link entry
- Updated INDEX.md

**Error paths:**
- Unqualified source → exit with "Use qualified form prefix:slug."
- Unqualified target → exit with "Use qualified form prefix:slug."
- Invalid edge type → exit with error listing valid edge types
- Source not found → exit with "Source 'prefix:slug' not found."
- Target not found → exit with "Target 'prefix:slug' not found."
- Edge not allowed for type pair → exit with "Edge '{edge}' is not allowed from {sourceType} to {targetType}."
- Duplicate link → exit with "Link already exists: source → edge → target."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
