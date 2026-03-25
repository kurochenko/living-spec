---
type: decision
name: Bidirectional Subgraph Traversal
id: bidirectional-subgraph-traversal
links:
  - edge: depends-on
    target: 'term:index'
  - edge: depends-on
    target: 'term:primitive'
tags:
  - cli
---

**Context:** `lore show --related` needs to determine which primitives are connected to the target. The graph has directed edges (e.g., `depends-on`, `includes`), so a decision is needed on traversal direction.

**Decision:** BFS follows both outgoing links (targets of the [[term:primitive]]'s links) and incoming links (any primitive that links to this one). This gives the complete connected component regardless of edge direction, using [[term:index]] to discover inbound edges efficiently.

**Alternatives considered:**
- Outgoing only — misses important context (e.g., a feature that `includes` the target would not appear)
- Incoming only — misses what the target depends on
- Depth-limited traversal — arbitrary cutoff, hard to choose the right depth

**Consequences:** `--related` returns the full connected component. For densely linked specs this could return a large subgraph, which is the correct behavior — the LLM needs the full context. Future optimization: add `--depth <n>` flag if subgraphs grow too large.
