---
type: rule
name: Migration Required
id: migration-required
context: lore
links:
  - edge: constrains
    target: term:migration
tags: [core, v0.2]
---

**Policy:** Before any `lore` command executes (except `lore migrate` itself), the CLI checks if the spec requires migration.

**Check logic:**
1. Read `.spec/VERSION` from spec root
2. Compare against CLI's known migration target versions
3. If `.spec/VERSION` is less than any pending migration target → exit with error

**On violation:** `lore` exits with error:
```
Spec at v{spec_version}, but v{target_version} required by migration '{target_version}'.
Run 'lore migrate' to apply pending migrations.
```

**Note:** `lore migrate` itself does not perform this check — it is the migration command and must be allowed to run even when migrations are pending.

**See also:** `migration`, `automatic-migration`, `manual-migration`