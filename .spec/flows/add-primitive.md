---
type: flow
name: Add Primitive
id: add-primitive
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:primitive-type
  - edge: depends-on
    target: inv:unique-primitive-id
  - edge: depends-on
    target: dec:index-rebuild-on-write
tags: [cli]
---

**Trigger:** User runs `lore add <type> <id>` with optional flags

**Inputs:**
- `<type>` (required) — one of the eight primitive types
- `<id>` (required) — kebab-case identifier
- `--context, -c` (optional) — bounded context name, defaults to empty
- `--name, -n` (optional) — human-readable name, defaults to title-cased id
- `--body, -b` (optional) — prose body text

**Steps:**
1. Validate type is one of the eight allowed primitive types → exit with error if not
2. Validate id matches kebab-case pattern → exit with error if not
3. Find project root (walk up for `.spec/SPEC.md`)
4. Scan all existing primitives across all types for duplicate id → exit with error showing existing path if found
5. Read template from `.spec/templates/{type}.md` if it exists
6. Build file with YAML frontmatter (type, name, id, context, links: [], tags: []) and body from template or `--body`
7. Write file to `.spec/{type}s/{id}.md`
8. Rebuild INDEX.md
9. Print confirmation: `Created {type} '{id}' at .spec/{type}s/{id}.md`

**Outputs:**
- New primitive file at `.spec/{type}s/{id}.md`
- Updated INDEX.md

**Error paths:**
- Invalid type → exit with error listing valid types
- Invalid id (not kebab-case) → exit with error
- Duplicate id → exit with error showing path of existing primitive
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
