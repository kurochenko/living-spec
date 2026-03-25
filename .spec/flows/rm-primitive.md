---
type: flow
name: Remove Primitive
id: rm-primitive
links:
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
---

**Trigger:** User runs `lore rm <prefix:slug>`

**Steps:**
1. Parse ref → exit with error if not qualified form
2. Find project root (walk up for `.spec/SPEC.md`)
3. Look up the [[term:primitive]] → exit with error if not found
4. Scan all [[term:primitive]]s for inbound references (any link whose target matches this ref)
5. If inbound references exist → print warnings listing each referencing primitive, then exit with error unless `--force` is passed
6. Delete the primitive file from disk
7. Rebuild INDEX.md according to [[dec:index-rebuild-on-write]]
8. Print confirmation: `Removed prefix:slug`

**Inputs:**
- `<ref>` (required) — qualified ref of the primitive to remove (prefix:slug)
- `--force` (optional) — skip the dangling reference check and delete anyway

**Outputs:**
- Primitive file deleted from disk
- Updated INDEX.md

**Error paths:**
- Unqualified ref → exit with "Use qualified form prefix:slug."
- Primitive not found → exit with "Primitive 'prefix:slug' not found."
- Inbound references exist without --force → exit with "Cannot remove prefix:slug — referenced by: ..." listing each referencing primitive
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
