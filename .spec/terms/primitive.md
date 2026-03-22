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

A typed knowledge unit in the spec. Each primitive is a single markdown file with YAML frontmatter and a prose body. Stored in `.spec/{type}s/{id}.md`.

Eight types exist: term, invariant, rule, event, flow, contract, decision, feature. A primitive is identified by a globally unique kebab-case `id`.
