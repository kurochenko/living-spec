---
type: flow
name: Init Spec
id: init-spec
context: lore
links:
  - edge: depends-on
    target: term:spec-root
  - edge: depends-on
    target: term:primitive-type
tags: [cli]
---

**Trigger:** User runs `lore init` (optionally with `--dir <path>`)

**Inputs:**
- `--dir` (optional) — directory to initialize in, defaults to cwd

**Steps:**
1. Resolve target directory
2. Check if `.spec/SPEC.md` already exists → if yes, print `.spec/ already exists at {path}` and exit
3. Create `.spec/` with subdirectories: `templates/`, and one folder per primitive type (terms/, invariants/, rules/, events/, flows/, contracts/, decisions/, features/)
4. Write `.spec/SPEC.md` (the seed file with meta-model and LLM instructions)
5. Write `.spec/INDEX.md` (empty index)
6. Write `.spec/templates/{type}.md` for each of the eight types
7. Print confirmation with created structure

**Outputs:**
- Complete `.spec/` directory ready for use

**Error paths:**
- Target directory doesn't exist → exit with error
