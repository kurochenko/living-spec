---
type: feature
name: CLI Migrate
id: cli-migrate
links:
  - edge: includes
    target: 'term:migration'
  - edge: includes
    target: 'term:automatic-migration'
  - edge: includes
    target: 'term:manual-migration'
  - edge: includes
    target: 'rule:migration-required'
  - edge: includes
    target: 'flow:run-migrations'
tags:
  - cli
  - v0.2
---

**Summary:** The `lore migrate` command. Applies pending [[term:migration]]s in version order, distinguishes between [[term:automatic-migration]] and [[term:manual-migration]], respects [[rule:migration-required]], and executes the behavior described by [[flow:run-migrations]].

**Acceptance criteria:**
- `lore migrate` with no pending migrations → exit 0 with "No pending migrations."
- Pending automatic migrations are applied directly by the CLI in version order
- Pending manual migrations generate a review artifact and stop until explicitly confirmed
- `lore migrate --confirm <version>` advances `.spec/VERSION` only for the next pending manual migration with the same target version
- `lore migrate --confirm <version>` does not verify correctness; it marks the manual migration as accepted
- `lore migrate` stops at the first pending manual migration and surfaces the review artifact or instructions needed to continue
- Re-running `lore migrate` continues from the current `.spec/VERSION`
- `lore migrate --confirm <version>` errors if there is no matching next pending manual migration

**Open questions:**
- None
