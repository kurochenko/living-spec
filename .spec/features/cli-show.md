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

**Summary:** The `lore show <id>` command. Looks up a primitive by id and prints its type, name, context, links, tags, and body. With `--related`, performs a BFS to print the full connected subgraph.

**Acceptance criteria:**
- `lore show my-term` prints the primitive's frontmatter and body
- Unknown id exits with "Primitive '{id}' not found."
- `lore show my-term --related` prints all transitively connected primitives separated by `---`
- Subgraph traversal follows both outgoing and incoming links
- Deprecated primitives show a warning indicator

**Open questions:**
- None
