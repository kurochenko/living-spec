---
type: flow
name: Show Primitive
id: show-primitive
links:
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'term:index'
  - edge: depends-on
    target: 'dec:bidirectional-subgraph-traversal'
tags:
  - cli
---

**Trigger:** User runs `lore show <prefix:slug>` with optional `--related` flag

**Inputs:**
- `<prefix:slug>` (required) — qualified [[term:primitive]] id. Unqualified slugs are not accepted.
- `--related, -r` (optional) — expand to full connected subgraph

**Steps:**
1. Parse qualified ref → exit with error if not in `prefix:slug` format
2. Find project root (walk up for `.spec/SPEC.md`)
3. Look up primitive by type + slug → exit with error if not found
4. If no `--related` flag: print the single [[term:primitive]] (type, name, qualified id, context, deprecated flag, tags, links, body) and exit
5. If `--related`: load all primitives from [[term:index]] and BFS from the target following both outgoing and incoming links as defined by [[dec:bidirectional-subgraph-traversal]], then print each connected primitive separated by `---`

**Outputs:**
- Single primitive display, or full subgraph display

**Error paths:**
- Unqualified id → exit with "Use qualified form prefix:slug. E.g., `term:my-term`."
- Primitive not found → exit with "Primitive 'prefix:slug' not found."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
