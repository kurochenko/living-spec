---
type: feature
name: CLI Show
id: cli-show
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: flow:show-primitive
  - edge: includes
    target: dec:bidirectional-subgraph-traversal
tags: [cli, v0.1]
---

**Summary:** The `lore show <prefix:slug>` command. Requires a qualified id. Prints the primitive's type, name, context, links, tags, and body. With `--related`, performs a BFS to print the full connected subgraph.

**Acceptance criteria:**
- `lore show term:my-term` prints the primitive's frontmatter and body
- Unqualified slug (e.g., `lore show my-term`) exits with error requiring qualified form
- Unknown qualified id exits with "Primitive 'prefix:slug' not found."
- `lore show term:my-term --related` prints all transitively connected primitives separated by `---`
- Subgraph traversal follows both outgoing and incoming links
- Deprecated primitives show a warning indicator

**Open questions:**
- None
