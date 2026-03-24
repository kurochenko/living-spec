---
type: flow
name: Migrate Wrappers
id: migrate-wrappers
context: lore
links:
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:index
  - edge: depends-on
    target: inv:primitive-refs-wrapped
  - edge: depends-on
    target: rule:link-prose-consistency
tags: [cli, v0.2]
---

**Trigger:** User runs `lore migrate --wrappers`

**Inputs:**
- `--dry-run` (optional) — show what would change without modifying files

**Steps:**
1. Scan all `.spec/**/*.md` files
2. For each file, parse frontmatter `links:` → collect all target refs
3. For each file's prose body:
   a. Find all existing [[...]] wrappers → extract target IDs
   b. Find all bare primitive ID mentions (pattern: `prefix:slug` or `context.prefix:slug` not wrapped)
   c. Find prose mentions that look like primitive names but aren't full IDs (for LLM to decide)
4. Group findings:
   a. Files with frontmatter links missing [[...]] prose mentions
   b. Files with [[...]] wrappers not linked in frontmatter
   c. Files with bare unwrapped refs that need wrapping
   d. Potential matches (plain text mentions that might correspond to a primitive)
5. Output a **migration guide** for LLM containing:
   - List of all primitives with their IDs and human-readable names
   - For each file needing changes: the current prose and suggested [[...]] insertions
   - Instructions for LLM on how to make changes
   - Ambiguity handling guidance (what to do when a mention might match multiple primitives)
6. If `--dry-run`: output guide to stdout only, no file changes
7. If not `--dry-run`: write migration guide to `.spec/.migrate-wrappers-guide.md` for LLM review

**Outputs:**
- Migration guide written to `.spec/.migrate-wrappers-guide.md` (unless `--dry-run`)
- Exit 0 on success, exit 1 if no changes needed

**Ambiguity handling:**
- If "review context package" might match `review.term:review-context-package` AND `review.term:review-package`, flag as ambiguous and ask user/LLM to clarify
- Never auto-resolve ambiguity — always report and let LLM/user decide

**LLM Instructions in migration guide:**
```
## How to wrap primitive references

When you see a primitive ID mentioned in prose without [[...]]:
1. Find the matching primitive in the spec index below
2. Wrap it as `[[prefix:slug]]` or `[[context.prefix:slug]]` depending on whether disambiguation is needed
3. Ensure the wrapped reference appears in a grammatically appropriate place

Example transformation:
Before: "The review harness reads the review context package and produces findings."
After:  "The [[review.harness:review-harness]] reads the [[review.term:review-context-package]] and produces [[review.term:review-finding]]."
```