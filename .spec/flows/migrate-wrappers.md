---
type: flow
name: Migrate Wrappers
id: migrate-wrappers
context: lore
links:
  - edge: depends-on
    target: flow:run-migrations
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: inv:primitive-refs-wrapped
  - edge: depends-on
    target: rule:link-prose-consistency
tags: [cli, v0.2]
---

**Trigger:** `lore migrate` encounters pending manual migration `0.2.0`

**Purpose:** Generate the review artifact for the v0.2.0 migration that introduces wrapped prose references and prose/frontmatter link consistency.

**Steps:**
1. Scan all `.spec/**/*.md` files
2. For each file, parse frontmatter `links:` → collect all target refs
3. For each file's prose body:
   a. Find all existing `[[...]]` wrappers → extract target IDs
   b. Resolve each wrapped ref using the same rules as the CLI (`prefix:slug` or `context.prefix:slug`)
   c. Find all bare primitive ID mentions (`prefix:slug` or `context.prefix:slug`) that occur outside `[[...]]`
4. Group findings:
   a. Files with frontmatter links missing `[[...]]` prose mentions
   b. Files with `[[...]]` wrappers not linked in frontmatter
   c. Files with frontmatter links that do not resolve to a primitive
   d. Files with invalid or context-missing wrapped refs
   e. Probable bare refs that should be reviewed
5. Output a **migration guide** for LLM containing:
   - List of all primitives with their IDs and human-readable names
   - For each file needing changes: the current inconsistencies and suggested `[[...]]` insertions or frontmatter updates
   - Instructions for LLM on how to make changes
   - Bare-ref review guidance (treat as suspicious, not as a blocking proof by itself)
   - A reminder that a reviewer must run `lore migrate --confirm 0.2.0` after accepting the manual migration
6. The generic migration runner stops after writing `.spec/.migrate-0.2.0-guide.md`
7. Reviewer makes any desired spec edits and then runs `lore migrate --confirm 0.2.0` to accept the migration and advance `.spec/VERSION`

**Outputs:**
- Review artifact content for `.spec/.migrate-{version}-guide.md`
- Reviewer confirmation via `lore migrate --confirm 0.2.0`

**LLM Instructions in migration guide:**
```
## How to wrap primitive references

When you see a primitive ID mentioned in prose without [[...]]:
1. Find the matching primitive in the spec index below
2. Wrap shared primitives as `[[term:primitive]]`
3. Wrap contextual primitives as `[[context.term:primitive]]`
4. Ensure the wrapped reference appears in a grammatically appropriate place

Example transformation:
Before: "The add command creates primitives and updates the index."
After:  "The [[lore.feat:cli-add]] reads the [[lore.term:primitive]] and updates the [[lore.term:index]]."
```
