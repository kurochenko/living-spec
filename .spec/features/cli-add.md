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

**Summary:** The `lore add <type> <id>` command. Creates a new primitive file from the matching template, validates type and id, enforces global id uniqueness, and rebuilds INDEX.md.

**Acceptance criteria:**
- `lore add term my-term` creates `.spec/terms/my-term.md` with frontmatter and template body
- `--context`, `--name`, `--body` flags populate the corresponding fields
- Name defaults to title-cased id when not provided
- Invalid type exits with error listing valid types
- Non-kebab-case id exits with error
- Duplicate id exits with error showing existing file path
- INDEX.md is rebuilt after successful add

**Open questions:**
- None
