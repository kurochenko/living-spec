---
type: term
name: Primitive
id: primitive
context: lore
links:
  - edge: includes
    target: term:primitive-type
tags: [core]
---

A typed knowledge unit in the spec. Each primitive is a single markdown file with YAML frontmatter and a prose body. Stored in `.spec/{type}s/{slug}.md` (or `.spec/{type}s/{context}.{slug}.md` when a bounded context is specified).

Eight types exist: term, invariant, rule, event, flow, contract, decision, feature. A primitive is identified by its (type, context, slug) triple. The qualified ref is `prefix:slug` when unambiguous, or `context.prefix:slug` when disambiguation is needed.
