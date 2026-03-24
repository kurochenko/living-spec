---
type: flow
name: Run Migrations
id: run-migrations
context: lore
links:
  - edge: depends-on
    target: term:migration
  - edge: depends-on
    target: term:automatic-migration
  - edge: depends-on
    target: term:manual-migration
  - edge: depends-on
    target: rule:migration-required
tags: [cli, v0.2]
---

**Trigger:** User runs `lore migrate` or `lore migrate --confirm <version>`

**Steps:**
1. Find project root and read `.spec/VERSION`
2. Compare the current version against the CLI's ordered migration list
3. If no migrations are pending: print "No pending migrations." and exit 0
4. Iterate pending migrations in ascending target-version order. Migrations are never skipped.
5. If the next pending migration is automatic:
   a. Apply it directly
   b. Write its target version to `.spec/VERSION`
   c. Continue to the next pending migration
6. If the next pending migration is manual and no `--confirm <version>` was provided:
   a. Generate that migration's review artifact or instructions
   b. Stop without advancing `.spec/VERSION`
7. If the next pending migration is manual and `--confirm <version>` was provided:
   a. If `<version>` does not equal that next pending manual migration's target version: exit with error
   b. Accept the manual migration without re-verifying correctness
   c. Write that target version to `.spec/VERSION`
   d. Continue to later pending automatic migrations, if any
   e. If another manual migration is encountered later in the same run: stop again and require `--confirm` for that version
8. After the last pending migration completes: print success and exit 0

**Outputs:**
- Updated `.spec/VERSION` after each completed migration
- Review artifact or instructions for the first pending manual migration that was not confirmed
- Exit code 0

**Error paths:**
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
- Migration list contains invalid ordering or missing implementation → exit with error
- `--confirm <version>` used when no manual migration is pending → exit with error
- `--confirm <version>` used for the wrong version → exit with error
