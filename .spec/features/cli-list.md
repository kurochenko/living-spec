---
type: feature
name: CLI List
id: cli-list
links:
  - edge: includes
    target: 'term:primitive'
  - edge: includes
    target: 'term:primitive-type'
  - edge: includes
    target: 'flow:list-primitives'
tags:
  - cli
  - v0.2
---

**Summary:** The `lore list` command. Lists [[term:primitive]]s, optionally filtered by [[term:primitive-type]], through [[flow:list-primitives]].

**Acceptance criteria:**
- `lore list` prints all primitives as `prefix:slug  name`
- `--type term` filters to terms only
- Invalid type → exit with error
- Empty result prints `(none)`
