---
type: flow
name: List Primitives
id: list-primitives
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:primitive-type
tags: [cli]
---

**Trigger:** User runs `lore list [--type <type>]`

**Steps:**
1. Find project root (walk up for `.spec/SPEC.md`)
2. Load all primitives
3. If `--type` is provided, filter to that type → exit with error if invalid type
4. Print one line per primitive: `prefix:slug  name`
5. If no primitives match, print `(none)`

**Inputs:**
- `--type` (optional) — filter by primitive type (e.g., `term`, `flow`, `invariant`)

**Outputs:**
- Printed list of primitives to stdout

**Error paths:**
- Invalid type filter → exit with error listing valid types
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
