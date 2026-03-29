---
type: decision
name: Context Overviews Outside Graph
id: context-overviews-outside-graph
context: lore
links:
  - edge: depends-on
    target: term:bounded-context
  - edge: depends-on
    target: lore.term:context-overview
  - edge: depends-on
    target: term:index
tags: [core]
---

**Context:**

Teams need somewhere to explain what a bounded context is for, what it owns, and how it relates to adjacent contexts. That information is too broad for a single Feature or Flow, but making context itself into a primitive would turn a namespace into a graph node.

**Decision:**

Represent that high-level narrative as a [[lore.term:context-overview]] file at `.spec/contexts/<context>.md`. The file is queryable through dedicated CLI commands, but it stays outside the primitive graph and outside the [[term:index]].

**Alternatives considered:**

1. Add a new primitive type for contexts. Rejected because the graph already uses the `context` field as the source of truth for identity and membership.
2. Keep all context explanation distributed across Features and Flows. Rejected because there is no single entry point for purpose, ownership boundaries, and exclusions.
3. Add a manual list of all primitives to each overview. Rejected because the list would drift from primitive frontmatter and duplicate information the CLI can derive.

**Consequences:**

- Context membership remains derived from primitive frontmatter rather than hand-authored containment edges.
- `.spec/INDEX.md` remains a graph of primitives only.
- The CLI needs explicit commands to scaffold and display context overviews.
- Context overviews can curate important refs, but they are narrative documents rather than graph nodes.

**Supersedes:**

- None
