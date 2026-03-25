---
type: flow
name: Migrate Wrappers
id: migrate-wrappers
links:
  - edge: depends-on
    target: 'flow:run-migrations'
  - edge: depends-on
    target: 'term:primitive'
  - edge: depends-on
    target: 'inv:primitive-refs-wrapped'
  - edge: depends-on
    target: 'rule:link-prose-consistency'
tags:
  - cli
  - v0.2
---

**Trigger:** `lore migrate` encounters the `0.2.0` step while executing [[flow:run-migrations]]

**Purpose:** Generate the review artifact for the v0.2.0 [[term:primitive]]-linking migration that introduces the wrapper syntax from [[inv:primitive-refs-wrapped]] and the consistency rule from [[rule:link-prose-consistency]].

**Steps:**
1. Refresh framework-owned files from the current CLI seed:
   a. Overwrite `.spec/SPEC.md`
   b. Overwrite `.spec/templates/*.md`
2. Scan primitive files only (`.spec/{terms,invariants,rules,events,flows,contracts,decisions,features}/*.md`)
3. For each primitive file, parse frontmatter `links:` → collect all target refs to other [[term:primitive]]s
4. For each primitive file's prose body:
   a. Find all existing `\[\[...\]\]` wrappers → extract target IDs
   b. Resolve each wrapped ref using the same rules as the CLI (`prefix:slug` or `context.prefix:slug`)
   c. Find all bare primitive ID mentions (`prefix:slug` or `context.prefix:slug`) that occur outside `\[\[...\]\]`
5. Group findings:
   a. Files with frontmatter links missing `\[\[...\]\]` prose mentions
   b. Files with `\[\[...\]\]` wrappers not linked in frontmatter
   c. Files with frontmatter links that do not resolve to a primitive
   d. Files with invalid or context-missing wrapped refs
   e. Probable bare refs that should be reviewed
6. Output a **migration guide** for LLM containing:
   - List of all primitives with their IDs and human-readable names
   - For each file needing changes: the current inconsistencies and suggested `\[\[...\]\]` insertions or frontmatter updates
   - A note that `.spec/SPEC.md` and `.spec/templates/*.md` were refreshed automatically by the CLI
   - Instructions for LLM on how to make changes
   - Bare-ref review guidance (treat as suspicious, not as a blocking proof by itself)
   - A reminder that a reviewer must run `lore migrate --confirm 0.2.0` after accepting the manual migration
7. [[flow:run-migrations]] stops after writing `.spec/.migrate-0.2.0-guide.md`
8. Reviewer makes any desired primitive-file edits and then runs `lore migrate --confirm 0.2.0` to accept the migration and advance `.spec/VERSION`

**Outputs:**
- Review artifact content for `.spec/.migrate-{version}-guide.md`
- Reviewer confirmation via `lore migrate --confirm 0.2.0`

**LLM Instructions in migration guide:**
```
## How to wrap primitive references

When you see a primitive ID mentioned in prose without `\[\[...\]\]`:
1. Find the matching primitive in the spec index below
2. Wrap shared primitives as `\[\[term:primitive\]\]`
3. Wrap contextual primitives as `\[\[billing.term:status\]\]`
4. Ensure the wrapped reference appears in a grammatically appropriate place

Example transformation:
Before: "The add command creates primitives and updates the index."
After:  "The \[\[feature-ref\]\] reads the \[\[shared-term-ref\]\] and updates the \[\[shared-index-ref\]\]."
```
