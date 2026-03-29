---
type: term
name: Spec Root
id: spec-root
links:
  - edge: includes
    target: 'term:index'
tags:
  - core
---

The `.spec/` directory at the root of a project. Contains everything: SPEC.md (the seed file), [[term:index]], templates/ (one per primitive type), and the eight primitive folders (terms/, invariants/, rules/, events/, flows/, contracts/, decisions/, features/).

The CLI auto-detects the spec root by walking up from cwd looking for `.spec/SPEC.md`.
