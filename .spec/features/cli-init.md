---
type: feature
name: CLI Init
id: cli-init
context: lore
links:
  - edge: includes
    target: term:spec-root
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:primitive-type
  - edge: includes
    target: term:index
  - edge: includes
    target: inv:single-spec-per-project
  - edge: includes
    target: flow:init-spec
  - edge: includes
    target: dec:primitives-inside-spec
  - edge: includes
    target: dec:auto-detect-spec-root
tags: [cli, v0.1]
---

**Summary:** The `lore init` command. Creates `.spec/` with SPEC.md, INDEX.md, templates, and primitive subfolders in the target directory.

**Acceptance criteria:**
- `lore init` creates complete `.spec/` structure in cwd
- `lore init --dir <path>` creates it in the specified directory
- Running init where `.spec/` exists prints `.spec/ already exists at {path}` and does nothing
- All eight template files are created
- All eight primitive folders are created inside `.spec/`

**Open questions:**
- None
