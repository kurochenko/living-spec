---
type: flow
name: Deprecate Primitive
id: deprecate-primitive
links:
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
---

**Trigger:** User runs `lore deprecate <prefix:slug>`

**Steps:**
1. Parse ref → exit with error if not qualified form
2. Find project root (walk up for `.spec/SPEC.md`)
3. Look up the [[term:primitive]] → exit with error if not found
4. If already deprecated → print message and exit 0
5. Set `deprecated: true` in frontmatter
6. Write file back
7. Rebuild INDEX.md according to [[dec:index-rebuild-on-write]]
8. Print confirmation: `Deprecated prefix:slug`

**Inputs:**
- `<ref>` (required) — qualified ref of the primitive to deprecate (prefix:slug)

**Outputs:**
- Updated primitive file with `deprecated: true`
- Updated INDEX.md

**Error paths:**
- Unqualified ref → exit with "Use qualified form prefix:slug."
- Primitive not found → exit with "Primitive 'prefix:slug' not found."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
