---
type: decision
name: Prefix as Type Shorthand
id: prefix-as-type-shorthand
context: lore
links:
  - edge: depends-on
    target: term:primitive-type
tags: [cli, ux]
---

**Context:** CLI commands that accept a primitive type as input (e.g., `lore add <type>`, `lore list --type <type>`) originally required the full type name (`feature`, `invariant`, etc.). Users already memorize the short prefixes from qualified IDs (`feat`, `inv`, etc.), so requiring the long form is friction.

**Decision:** Accept both the full type name and the prefix wherever a type is expected as CLI input. Resolution happens in `validateType` — the single entry point for all type validation.

**Affected commands:**
- `lore add <type> <slug>` — the `<type>` argument
- `lore list --type <type>` — the `--type` option
- Any future command that takes a type as input

**Alternatives considered:**
- Only accept full names → rejected, users will type `feat` and get confused
- Only accept prefixes → rejected, inconsistent with the type names used in frontmatter and spec docs

**Consequences:**
- `validateType` must resolve prefixes via `PREFIX_TO_TYPE` before validation
- Error messages must list both full names and prefixes
- Frontmatter always stores the full type name, never the prefix — resolution is input-only
