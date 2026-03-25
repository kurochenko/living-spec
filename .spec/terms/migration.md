---
type: term
name: Migration
id: migration
links:
  - edge: includes
    target: 'term:automatic-migration'
  - edge: includes
    target: 'term:manual-migration'
tags: [core, v0.2]
---

**Definition:** A transformation that updates the spec format from one version to another. Migrations are tracked in `.spec/VERSION`, defined by the CLI's migration list, and executed via `lore migrate`.

**Properties:**
- Each migration has a target version (e.g., `0.3.0`)
- Migrations are applied in order (lowest pending first)
- After a migration completes, `.spec/VERSION` is updated to the migration's target version
- A migration can be either [[term:automatic-migration]] or [[term:manual-migration]]
- A [[term:manual-migration]] is completed by explicit reviewer confirmation for the pending target version
- Later migrations never skip earlier pending ones; the ordered migration list is authoritative

**Trigger:** On any `lore` command, if `.spec/VERSION` is less than the CLI's known migrations, the CLI exits with instructions to run `lore migrate`.

