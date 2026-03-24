---
type: feature
name: CLI Migrate
id: cli-migrate
context: lore
links:
  - edge: includes
    target: term:primitive
  - edge: includes
    target: term:index
  - edge: includes
    target: flow:migrate-wrappers
  - edge: includes
    target: inv:primitive-refs-wrapped
  - edge: includes
    target: rule:link-prose-consistency
tags: [cli, v0.2]
---

**Summary:** The `lore migrate --wrappers` command. Scans all primitive files and generates a migration guide for LLM to add [[...]] wrappers to prose.

**Acceptance criteria:**
- `lore migrate --wrappers --dry-run` → outputs guide to stdout, no files created
- `lore migrate --wrappers` → creates `.spec/.migrate-wrappers-guide.md`
- No changes needed → exit 0 with "No wrappers needed. Spec is consistent."
- Generates accurate list of all primitives with IDs and names for LLM reference
- Identifies all files with frontmatter links missing [[...]] in prose
- Identifies all [[...]] wrappers that don't correspond to frontmatter links
- Flags ambiguous plain-text mentions that might match multiple primitives
- Migration guide includes clear instructions for LLM on how to wrap references

**Open questions:**
- None