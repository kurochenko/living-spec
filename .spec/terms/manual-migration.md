---
type: term
name: Manual Migration
id: manual-migration
context: lore
links:
  - edge: is-a
    target: term:migration
tags: [core, v0.2]
---

**Definition:** A migration that requires external review and execution (by human or LLM). The CLI generates a guide with instructions, but the actual changes to spec files are made by the reviewer and accepted explicitly.

**Characteristics:**
- CLI generates a migration guide (`.spec/.migrate-{version}-guide.md`)
- CLI exits after guide generation without advancing `.spec/VERSION`
- Reviewer (human or LLM) makes the required changes
- Reviewer runs `lore migrate --confirm <version>`
- CLI advances `.spec/VERSION` for that pending manual migration without re-verifying correctness
- If a later manual migration is still pending, the CLI stops again and requires another explicit confirmation for that later version

**Workflow:**
1. Run `lore migrate`
2. If a manual migration is pending: guide is generated, CLI exits with instructions
3. Reviewer reads guide and makes required changes
4. Reviewer runs `lore migrate --confirm <version>`
5. CLI advances `.spec/VERSION` and continues with later automatic migrations until the next manual migration, if any

**Example use cases:**
- Adding prose wrappers to primitive references (requires contextual prose changes)
- Refactoring terminology that appears throughout prose
- Any migration where mechanical transformation isn't sufficient

**See also:** `migration`, `automatic-migration`
