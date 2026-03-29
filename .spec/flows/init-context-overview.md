---
type: flow
name: Init Context Overview
id: init-context-overview
context: lore
links:
  - edge: depends-on
    target: lore.term:context-overview
  - edge: depends-on
    target: term:spec-root
tags: [cli]
---

**Trigger:** User runs `lore context init <name> -n "Human Readable Name"`.

**Inputs:**
- `<name>` — kebab-case bounded context name
- `-n, --name` — human-readable title written into the overview frontmatter

**Steps:**
1. Resolve the project root and ensure `.spec/` exists.
2. Ensure `.spec/contexts/` exists.
3. Check whether `.spec/contexts/<name>.md` already exists. If it does, print an error and exit.
4. Read the context overview template from `.spec/templates/context.md`.
5. Write `.spec/contexts/<name>.md` using the requested human-readable name.
6. Print the created file path.

**Outputs:**
- A new [[lore.term:context-overview]] file for the named context

**Error paths:**
- `.spec/` missing -> exit with error
- Invalid context name -> exit with error
- Overview file already exists -> exit with error
