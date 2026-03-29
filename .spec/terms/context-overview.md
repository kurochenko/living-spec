---
type: term
name: Context Overview
id: context-overview
context: lore
links:
  - edge: depends-on
    target: term:bounded-context
  - edge: depends-on
    target: term:primitive
  - edge: depends-on
    target: term:spec-root
  - edge: depends-on
    target: term:index
tags: [core]
---

A context overview is a non-primitive markdown file stored at `.spec/contexts/<context>.md`. It explains the purpose, scope, boundaries, and curated entry points for a [[term:bounded-context]] without pretending to be the whole graph.

Context overviews live under the [[term:spec-root]] so an LLM can read one high-level entry point before traversing the underlying [[term:primitive]] files. They may mention important primitives with `[[...]]` refs, but they do not participate in typed edges and do not appear in the [[term:index]].
