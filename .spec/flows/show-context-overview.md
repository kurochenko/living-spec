---
type: flow
name: Show Context Overview
id: show-context-overview
context: lore
links:
  - edge: depends-on
    target: lore.term:context-overview
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:primitive-type
tags: [cli]
---

**Trigger:** User runs `lore context show <name>`.

**Inputs:**
- `<name>` — kebab-case bounded context name

**Steps:**
1. Resolve the project root and read `.spec/contexts/<name>.md`.
2. Validate any wrapped primitive refs in the overview body.
3. Print the overview frontmatter and body.
4. Read all [[term:primitive]] files whose frontmatter `context` equals `<name>`.
5. Group the matching primitives by [[term:primitive-type]].
6. Print the grouped list as derived membership for that context.

**Outputs:**
- The requested [[lore.term:context-overview]]
- The current primitive membership derived from frontmatter

**Error paths:**
- `.spec/` missing -> exit with error
- Overview file missing -> exit with error
- Invalid context name -> exit with error
- Wrapped primitive ref does not resolve -> exit with error
