---
type: flow
name: Add Primitive
id: add-primitive
links:
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'term:primitive-type'
  - edge: depends-on
    target: 'term:index'
  - edge: depends-on
    target: 'inv:unique-primitive-id'
  - edge: depends-on
    target: 'dec:index-rebuild-on-write'
tags:
  - cli
---

**Trigger:** User runs `lore add <type> <slug>` with required flags

**Inputs:**
- `<type>` (required) — one of the eight [[term:primitive-type]]s
- `<slug>` (required) — kebab-case identifier
- `--name, -n` (required) — human-readable name
- `--body, -b` (required for inline) — prose body text
- `--body-file` (required for multi-line) — path to file containing body text. Mutually exclusive with `--body`.
**Steps:**
1. Validate type is one of the eight allowed primitive types → exit with error if not
2. Validate slug matches kebab-case pattern → exit with error if not
3. Validate name is provided → exit with error if not
4. Validate body is provided via `--body` or `--body-file` → exit with error if neither
5. Find project root (walk up for `.spec/SPEC.md`)
6. Scan existing primitives of the same type for duplicate slug under [[inv:unique-primitive-id]] → exit with error showing existing path if found
7. If `--body-file`, read body from file → exit with error if file not found
8. Build the new [[term:primitive]] file with YAML frontmatter (type, name, id, links: [], tags: []) and body
9. Write the [[term:primitive]] file to `.spec/{type}s/{slug}.md`
10. Rebuild [[term:index]] according to [[dec:index-rebuild-on-write]]
11. Print confirmation: `Created prefix:slug at .spec/{type}s/{slug}.md`

**Outputs:**
- New primitive file at `.spec/{type}s/{slug}.md`
- Updated INDEX.md

**Error paths:**
- Invalid type → exit with error listing valid types
- Invalid slug (not kebab-case) → exit with error
- Missing name → exit with "Name is required. Use -n 'Human Readable Name'."
- Missing body → exit with "Body is required. Use -b for inline or --body-file for multi-line."
- Body file not found → exit with error showing path
- Duplicate slug within type → exit with error showing path of existing primitive
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
