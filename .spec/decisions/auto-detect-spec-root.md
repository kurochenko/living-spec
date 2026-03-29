---
type: decision
name: Auto-detect Spec Root
id: auto-detect-spec-root
links:
  - edge: depends-on
    target: 'term:spec-root'
tags:
  - cli
---

**Context:** The CLI needs to find the `.spec/` folder without explicit configuration.

**Decision:** Walk up from cwd looking for `.spec/SPEC.md`. The first match is the [[term:spec-root]].

**Alternatives considered:**
- `--root` flag on every command — too verbose for frequent use
- Config file (`.lorerc`) — unnecessary complexity
- Environment variable — invisible, easy to forget

**Consequences:** Zero config. Works like git finding `.git/`. Fails outside an initialized project, which is correct behavior.
