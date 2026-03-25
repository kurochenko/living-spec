---
type: decision
name: Index Rebuild on Write
id: index-rebuild-on-write
links:
  - edge: depends-on
    target: 'term:index'
tags:
  - cli
  - core
---

**Context:** The INDEX.md graph needs to stay in sync with primitive files after every mutation.

**Decision:** Every CLI write command (add, link, unlink, deprecate) triggers a full rebuild of [[term:index]] by scanning all primitive files.

**Alternatives considered:**
- Incremental update (patch only the changed entry) — error-prone if files are edited manually outside the CLI
- Manual rebuild command (`lore reindex`) — easy to forget, index drifts silently
- File watcher — unnecessary complexity, doesn't work in CI

**Consequences:** INDEX.md is always consistent with the files on disk. Slight overhead on large specs (full scan), but acceptable for the expected scale. Manual edits to primitives outside the CLI are picked up on the next CLI write.
