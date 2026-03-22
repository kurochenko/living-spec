---
type: feature
name: CLI Add
id: cli-add
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:primitive-type
  - edge: includes
    target: term:index
  - edge: includes
    target: inv:unique-primitive-id
  - edge: includes
    target: flow:add-primitive
  - edge: includes
    target: dec:index-rebuild-on-write
tags: [cli, v0.1]
---

**Summary:** The `lore add <type> <slug>` command. Creates a new primitive file, validates type and slug, enforces per-type uniqueness, requires name and body, and rebuilds INDEX.md.

**Acceptance criteria:**
- `lore add term my-term -n "My Term" -b "Definition here"` creates `.spec/terms/my-term.md` with correct frontmatter and body
- `--body-file <path>` reads body from file (for multi-line content)
- `--context` populates the context field
- Missing `-n` exits with error requiring name
- Missing `-b` / `--body-file` exits with error requiring body
- Invalid type exits with error listing valid types
- Non-kebab-case slug exits with error
- Duplicate slug within same type exits with error showing existing file path
- Same slug in a different type succeeds
- INDEX.md is rebuilt after successful add

**Open questions:**
- None
