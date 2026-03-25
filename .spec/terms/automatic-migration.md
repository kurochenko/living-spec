---
type: term
name: Automatic Migration
id: automatic-migration
links:
  - edge: is-a
    target: 'term:migration'
tags:
  - core
  - v0.2
---

**Definition:** A [[term:migration]] that the CLI executes without external intervention. All required changes are made directly to files by the CLI itself.

**Characteristics:**
- No guide generation needed
- No external review required
- CLI makes all file changes atomically
- After completion, `.spec/VERSION` is updated

**Example use cases:**
- Renaming primitive IDs (update frontmatter and file paths)
- Updating frontmatter schema (adding/removing fields)
- Fixing broken link references mechanically

