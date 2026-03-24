# Spec Index

Auto-maintained graph topology. One line per primitive, showing all outgoing links.
Rebuilt automatically by the lore CLI on every write command.

<!-- Format: - prefix:id (context) → edge: prefix:target, prefix:target; edge: prefix:target -->

## Terms

- lore.term:automatic-migration (lore) → is-a: term:migration
- lore.term:bounded-context (lore) → depends-on: term:primitive
- lore.term:index (lore) → depends-on: term:primitive
- lore.term:manual-migration (lore) → is-a: term:migration
- lore.term:migration (lore) → no links
- lore.term:primitive-type (lore) → no links
- lore.term:primitive (lore) → includes: term:primitive-type
- lore.term:spec-root (lore) → includes: term:index

## Invariants

- lore.inv:contextual-refs-qualified (lore) → constrains: term:primitive; depends-on: term:bounded-context
- lore.inv:primitive-refs-wrapped (lore) → constrains: term:primitive
- lore.inv:single-spec-per-project (lore) → constrains: term:spec-root
- lore.inv:unique-primitive-id (lore) → constrains: term:primitive; depends-on: term:bounded-context
- lore.inv:valid-edge-types (lore) → constrains: term:primitive

## Rules

- lore.rule:link-prose-consistency (lore) → constrains: term:primitive; depends-on: inv:primitive-refs-wrapped
- lore.rule:migration-required (lore) → constrains: term:migration

## Events

<!-- No events defined yet. -->

## Flows

- lore.flow:add-primitive (lore) → depends-on: term:primitive, term:primitive-type, inv:unique-primitive-id, dec:index-rebuild-on-write
- lore.flow:check-completeness (lore) → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- lore.flow:deprecate-primitive (lore) → depends-on: term:primitive, dec:index-rebuild-on-write
- lore.flow:init-spec (lore) → depends-on: term:spec-root, term:primitive-type
- lore.flow:link-primitives (lore) → depends-on: term:primitive, inv:valid-edge-types, dec:index-rebuild-on-write
- lore.flow:list-primitives (lore) → depends-on: term:primitive, term:primitive-type
- lore.flow:migrate-wrappers (lore) → depends-on: flow:run-migrations, term:primitive, inv:primitive-refs-wrapped, rule:link-prose-consistency
- lore.flow:reindex (lore) → depends-on: term:index, dec:index-rebuild-on-write
- lore.flow:rename-primitive (lore) → depends-on: term:primitive, inv:unique-primitive-id, dec:index-rebuild-on-write
- lore.flow:rm-primitive (lore) → depends-on: term:primitive, dec:index-rebuild-on-write
- lore.flow:run-migrations (lore) → depends-on: term:migration, term:automatic-migration, term:manual-migration, rule:migration-required
- lore.flow:show-primitive (lore) → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- lore.flow:unlink-primitives (lore) → depends-on: term:primitive, dec:index-rebuild-on-write

## Contracts

<!-- No contracts defined yet. -->

## Decisions

- lore.dec:auto-detect-spec-root (lore) → depends-on: term:spec-root
- lore.dec:bidirectional-subgraph-traversal (lore) → depends-on: term:index, term:primitive
- lore.dec:context-qualified-refs (lore) → depends-on: term:bounded-context, term:primitive, inv:unique-primitive-id
- lore.dec:index-rebuild-on-write (lore) → depends-on: term:index
- lore.dec:prefix-as-type-shorthand (lore) → depends-on: term:primitive-type
- lore.dec:primitives-inside-spec (lore) → depends-on: term:spec-root
- lore.dec:testable-primitives (lore) → depends-on: term:primitive-type

## Features

- lore.feat:cli-add (lore) → includes: term:primitive, term:primitive-type, term:index, inv:unique-primitive-id, flow:add-primitive, dec:index-rebuild-on-write
- lore.feat:cli-check (lore) → includes: term:primitive, term:index, flow:check-completeness, dec:bidirectional-subgraph-traversal
- lore.feat:cli-deprecate (lore) → includes: term:primitive, flow:deprecate-primitive, dec:index-rebuild-on-write
- lore.feat:cli-init (lore) → includes: term:spec-root, term:primitive, term:primitive-type, term:index, inv:single-spec-per-project, flow:init-spec, dec:primitives-inside-spec, dec:auto-detect-spec-root
- lore.feat:cli-link (lore) → includes: term:primitive, term:index, inv:valid-edge-types, flow:link-primitives, flow:unlink-primitives, dec:index-rebuild-on-write
- lore.feat:cli-list (lore) → includes: term:primitive, term:primitive-type, flow:list-primitives
- lore.feat:cli-migrate (lore) → includes: term:migration, term:automatic-migration, term:manual-migration, rule:migration-required, flow:run-migrations
- lore.feat:cli-reindex (lore) → includes: term:index, flow:reindex, dec:index-rebuild-on-write
- lore.feat:cli-rename (lore) → includes: term:primitive, term:index, inv:unique-primitive-id, flow:rename-primitive, dec:index-rebuild-on-write
- lore.feat:cli-rm (lore) → includes: term:primitive, term:index, flow:rm-primitive, dec:index-rebuild-on-write
- lore.feat:cli-show (lore) → includes: term:primitive, term:index, flow:show-primitive, dec:bidirectional-subgraph-traversal
