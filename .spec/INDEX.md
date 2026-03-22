# Spec Index

Auto-maintained graph topology. One line per primitive, showing all outgoing links.
Rebuilt automatically by the lore CLI on every write command.

<!-- Format: - prefix:id (context) → edge: prefix:target, prefix:target; edge: prefix:target -->

## Terms

- term:index (lore) → depends-on: term:primitive
- term:primitive-type (lore) → no links
- term:primitive (lore) → includes: term:primitive-type
- term:spec-root (lore) → includes: term:index

## Invariants

- inv:single-spec-per-project (lore) → constrains: term:spec-root
- inv:unique-primitive-id (lore) → constrains: term:primitive
- inv:valid-edge-types (lore) → constrains: term:primitive

## Rules

<!-- No rules defined yet. -->

## Events

<!-- No events defined yet. -->

## Flows

- flow:add-primitive (lore) → depends-on: term:primitive, term:primitive-type, inv:unique-primitive-id, dec:index-rebuild-on-write
- flow:check-completeness (lore) → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- flow:deprecate-primitive (lore) → depends-on: term:primitive, dec:index-rebuild-on-write
- flow:init-spec (lore) → depends-on: term:spec-root, term:primitive-type
- flow:link-primitives (lore) → depends-on: term:primitive, inv:valid-edge-types, dec:index-rebuild-on-write
- flow:list-primitives (lore) → depends-on: term:primitive, term:primitive-type
- flow:reindex (lore) → depends-on: term:index, dec:index-rebuild-on-write
- flow:rename-primitive (lore) → depends-on: term:primitive, inv:unique-primitive-id, dec:index-rebuild-on-write
- flow:rm-primitive (lore) → depends-on: term:primitive, dec:index-rebuild-on-write
- flow:show-primitive (lore) → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- flow:unlink-primitives (lore) → depends-on: term:primitive, dec:index-rebuild-on-write

## Contracts

<!-- No contracts defined yet. -->

## Decisions

- dec:auto-detect-spec-root (lore) → depends-on: term:spec-root
- dec:bidirectional-subgraph-traversal (lore) → depends-on: term:index, term:primitive
- dec:index-rebuild-on-write (lore) → depends-on: term:index
- dec:prefix-as-type-shorthand (lore) → depends-on: term:primitive-type
- dec:primitives-inside-spec (lore) → depends-on: term:spec-root
- dec:testable-primitives (lore) → depends-on: term:primitive-type

## Features

- feat:cli-add (lore) → includes: term:primitive, term:primitive-type, term:index, inv:unique-primitive-id, flow:add-primitive, dec:index-rebuild-on-write
- feat:cli-check (lore) → includes: term:primitive, term:index, flow:check-completeness, dec:bidirectional-subgraph-traversal
- feat:cli-deprecate (lore) → includes: term:primitive, flow:deprecate-primitive, dec:index-rebuild-on-write
- feat:cli-init (lore) → includes: term:spec-root, term:primitive, term:primitive-type, term:index, inv:single-spec-per-project, flow:init-spec, dec:primitives-inside-spec, dec:auto-detect-spec-root
- feat:cli-link (lore) → includes: term:primitive, term:index, inv:valid-edge-types, flow:link-primitives, flow:unlink-primitives, dec:index-rebuild-on-write
- feat:cli-list (lore) → includes: term:primitive, term:primitive-type, flow:list-primitives
- feat:cli-reindex (lore) → includes: term:index, flow:reindex, dec:index-rebuild-on-write
- feat:cli-rename (lore) → includes: term:primitive, term:index, inv:unique-primitive-id, flow:rename-primitive, dec:index-rebuild-on-write
- feat:cli-rm (lore) → includes: term:primitive, term:index, flow:rm-primitive, dec:index-rebuild-on-write
- feat:cli-show (lore) → includes: term:primitive, term:index, flow:show-primitive, dec:bidirectional-subgraph-traversal
