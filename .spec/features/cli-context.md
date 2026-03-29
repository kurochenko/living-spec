---
type: feature
name: CLI Context
id: cli-context
context: lore
links:
  - edge: includes
    target: term:bounded-context
  - edge: includes
    target: lore.term:context-overview
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:primitive-type
  - edge: includes
    target: term:spec-root
  - edge: includes
    target: lore.flow:init-context-overview
  - edge: includes
    target: lore.flow:show-context-overview
  - edge: includes
    target: lore.dec:context-overviews-outside-graph
tags: [cli, v0.3]
---

**Summary:** The `lore context` command group manages optional context overview files. It lets users scaffold a context overview and display that overview together with the primitives currently assigned to the same context.

**Acceptance criteria:**
- `lore context init <name> -n "Human Readable Name"` creates `.spec/contexts/<name>.md`
- `lore context show <name>` prints the overview file and derived primitive membership for that context
- Derived membership comes from primitive frontmatter `context`, not from a manual list in the overview file
- Wrapped primitive refs inside the overview body are validated when the overview is shown
- Missing context overview files fail with a clear error

**Open questions:**
- None
