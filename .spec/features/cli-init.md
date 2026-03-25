---
type: feature
name: CLI Init
id: cli-init
links:
  - edge: includes
    target: 'term:spec-root'
  - edge: includes
    target: 'term:primitive'
  - edge: includes
    target: 'term:primitive-type'
  - edge: includes
    target: 'term:index'
  - edge: includes
    target: 'inv:single-spec-per-project'
  - edge: includes
    target: 'flow:init-spec'
  - edge: includes
    target: 'dec:primitives-inside-spec'
  - edge: includes
    target: 'dec:auto-detect-spec-root'
tags:
  - cli
  - v0.1
---

**Summary:** The `lore init` command. Creates the [[term:spec-root]] with SPEC.md, [[term:index]], templates, and folders for each [[term:primitive-type]] so new [[term:primitive]]s can be added in the target directory. It follows [[flow:init-spec]], enforces [[inv:single-spec-per-project]], and uses [[dec:primitives-inside-spec]] plus [[dec:auto-detect-spec-root]].

**Acceptance criteria:**
- `lore init` creates complete `.spec/` structure in cwd
- `lore init --dir <path>` creates it in the specified directory
- Running init where `.spec/` exists prints `.spec/ already exists at {path}` and does nothing
- All eight template files are created
- All eight primitive folders are created inside `.spec/`
- After scaffolding, prints a ready-to-paste prompt snippet for agent integration (the user copies it into their LLM tool's config file)

**Open questions:**
- None
