---
type: flow
name: Check Completeness
id: check-completeness
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:index
  - edge: depends-on
    target: dec:bidirectional-subgraph-traversal
tags: [cli]
---

**Trigger:** User runs `lore check <prefix:slug>`

**Inputs:**
- `<ref>` (required) — qualified ref of any primitive to check (not limited to features)

**Steps:**
1. Parse ref → exit with error if not qualified form
2. Find project root (walk up for `.spec/SPEC.md`)
3. Look up the root primitive → exit with error if not found
4. Walk the dependency graph starting from the root:
   a. Collect all outgoing link targets recursively (follows `includes`, `depends-on`, `constrains`, `maps-to`, `emits`, `triggers`)
   b. For each target ref, check if a corresponding primitive file exists
   c. Track: visited primitives, dead refs (target has no file), deprecated refs
5. Report results:
   - If all refs resolve and none deprecated: print "✓ prefix:slug is complete. N primitives in scope."
   - If dead refs found: print each as "✗ missing: prefix:slug (referenced by prefix:slug via edge)"
   - If deprecated refs found: print each as "⚠ deprecated: prefix:slug (referenced by prefix:slug via edge)"
6. Exit 0 if complete, exit 1 if any dead refs found (deprecated alone is warning, not failure)

**Outputs:**
- Printed completeness report to stdout
- Exit code 0 (complete) or 1 (gaps found)

**Error paths:**
- Unqualified ref → exit with "Use qualified form prefix:slug."
- Primitive not found → exit with "Primitive 'prefix:slug' not found."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
