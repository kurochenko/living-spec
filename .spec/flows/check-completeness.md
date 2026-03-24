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
 5. Validate prose/frontmatter consistency for every visited primitive:
    a. Scan prose for `[[...]]` wrappers
    b. Resolve each wrapped ref to a primitive → error if invalid or ambiguous
    c. Resolve each frontmatter link target to a primitive → error if invalid or missing a required context prefix
    d. Compare the two resolved sets → error if either side is missing a match
    e. Scan prose for bare primitive-ref occurrences outside `[[...]]` → warn with file:line as probable unlinked or unwrapped mentions
 6. Report results:
    - If all refs resolve and none deprecated: print "✓ prefix:slug is complete. N primitives in scope."
    - If dead refs found: print each as "✗ missing: prefix:slug (referenced by prefix:slug via edge)"
    - If deprecated refs found: print each as "⚠ deprecated: prefix:slug (referenced by prefix:slug via edge)"
    - If frontmatter link target does not resolve: print each as "✗ invalid link target: prefix:slug ..."
    - If frontmatter link has no matching wrapped ref in prose: print each as "✗ linked but not wrapped: prefix:slug ..."
    - If wrapped ref has no matching frontmatter link: print each as "✗ not linked: `[[prefix:slug]]` ..."
    - If wrapped ref is invalid: print each as "✗ invalid ref: `[[prefix:slug]]` ..."
    - If probable bare ref found: print each as "⚠ probable bare ref: prefix:slug at line N"
 7. Exit 0 if complete or warnings-only, exit 1 if any dead refs or prose/frontmatter consistency errors are found

**Outputs:**
- Printed completeness report to stdout
- Exit code 0 (complete) or 1 (gaps found)

**Error paths:**
- Unqualified ref → exit with "Use qualified form prefix:slug."
- Primitive not found → exit with "Primitive 'prefix:slug' not found."
- No `.spec/` found → exit with "No .spec/ found. Run `lore init` first."
- Invalid `[[wrapped-ref]]` → error (target doesn't exist or short ref is ambiguous)
- Invalid frontmatter link target → error
- Linked but not wrapped → error
- Wrapped but not linked → error
- Bare primitive ref in prose → warning
