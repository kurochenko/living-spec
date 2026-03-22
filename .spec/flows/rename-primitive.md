---
type: flow
name: Rename Primitive
id: rename-primitive
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: inv:unique-primitive-id
  - edge: depends-on
    target: dec:index-rebuild-on-write
tags: [cli]
---

**Trigger:** User runs `lore rename <old-ref> <new-slug>`

**Inputs:**
- `<old-ref>` (required) — qualified ref of the primitive to rename (prefix:slug)
- `<new-slug>` (required) — new kebab-case slug (type stays the same)

**Steps:**
1. Parse old ref → exit with error if not qualified form
2. Validate new slug is kebab-case → exit with error if not
3. Find project root (walk up for `.spec/SPEC.md`)
4. Look up the old primitive → exit with error if not found
5. Check that no primitive of the same type already uses the new slug → exit with error if duplicate
6. Compute old and new qualified refs (e.g., `term:old-slug` → `term:new-slug`)
7. Update `id` field in frontmatter to the new slug
8. Rename the file on disk (`old-slug.md` → `new-slug.md`)
9. Scan all primitives for link targets matching the old qualified ref → rewrite each to the new qualified ref
10. Rebuild INDEX.md
11. Print confirmation: `Renamed old-ref → new-ref. Updated N inbound reference(s).`

**Outputs:**
- Renamed primitive file with updated id in frontmatter
- All inbound link targets rewritten to new qualified ref
- Updated INDEX.md

**Error paths:**
- Unqualified ref → exit with "Use qualified form prefix:slug."
- Invalid new slug (not kebab-case) → exit with error
- Old primitive not found → exit with "Primitive 'prefix:slug' not found."
- New slug already taken within same type → exit with "Primitive 'prefix:new-slug' already exists."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
