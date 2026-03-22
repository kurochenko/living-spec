---
type: flow
name: Show Primitive
id: show-primitive
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:index
  - edge: depends-on
    target: dec:bidirectional-subgraph-traversal
tags: [cli]
---

**Trigger:** User runs `lore show <id>` with optional `--related` flag

**Inputs:**
- `<id>` (required) — primitive id to look up
- `--related, -r` (optional) — expand to full connected subgraph

**Steps:**
1. Find project root (walk up for `.spec/SPEC.md`)
2. Search all primitives for matching id → exit with error if not found
3. If no `--related` flag: print single primitive (type, name, id, context, deprecated flag, tags, links, body) and exit
4. If `--related`: load all primitives, BFS from target following both outgoing and incoming links, print each connected primitive separated by `---`

**Outputs:**
- Single primitive display, or full subgraph display

**Error paths:**
- Primitive not found → exit with "Primitive '{id}' not found."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
