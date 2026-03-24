---
type: term
name: Bounded Context
id: bounded-context
context: lore
links:
  - edge: depends-on
    target: term:primitive
tags: [core]
---

A named domain boundary that scopes the meaning of all primitives within it. Two primitives with the same type and slug but different contexts are distinct concepts — e.g., `billing.term:status` (paid/unpaid/overdue) and `recipe.term:status` (draft/published/archived) are unrelated.

Context is not a primitive type — it has no file of its own. It exists as a `context` field in every primitive's frontmatter and as the namespace prefix for contextual refs (`context.prefix:slug`).

Contexts are implicit: they are created when the first primitive uses one. There is no upfront declaration. `lore list --context <name>` filters by context.

A primitive with no context (or a default/empty context) is a **shared concept** — available to all contexts. Examples: `term:money`, `term:timestamp`. These live at `.spec/{type}s/{slug}.md` with no context prefix in the filename or ref. The short form `prefix:slug` is reserved for these shared primitives.
