# Spec Index

Auto-maintained graph topology. One line per primitive, showing all outgoing links.
Rebuilt automatically by the lore CLI on every write command.

<!-- Format: - prefix:id (context) → edge: prefix:target, prefix:target; edge: prefix:target -->

## Terms

- term:automatic-migration → is-a: term:migration
- term:bounded-context → depends-on: term:primitive
- term:index → depends-on: term:primitive
- term:manual-migration → is-a: term:migration
- term:migration → includes: term:automatic-migration, term:manual-migration
- term:primitive-type → no links
- term:primitive → includes: term:primitive-type
- term:spec-root → includes: term:index

## Invariants

- inv:contextual-refs-qualified → constrains: term:primitive; depends-on: term:bounded-context
- inv:primitive-refs-wrapped → constrains: term:primitive
- inv:single-spec-per-project → constrains: term:spec-root
- inv:unique-primitive-id → constrains: term:primitive; depends-on: term:bounded-context
- inv:valid-edge-types → constrains: term:primitive

## Rules

- rule:link-prose-consistency → constrains: term:primitive; depends-on: inv:primitive-refs-wrapped
- rule:migration-required → constrains: term:migration

## Events

<!-- No events defined yet. -->

## Flows

- flow:add-primitive → depends-on: term:primitive, term:primitive-type, term:index, inv:unique-primitive-id, dec:index-rebuild-on-write
- flow:check-completeness → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- flow:deprecate-primitive → depends-on: term:primitive, dec:index-rebuild-on-write
- flow:init-spec → depends-on: term:spec-root, term:primitive-type
- flow:link-primitives → depends-on: term:primitive, inv:valid-edge-types, dec:index-rebuild-on-write
- flow:list-primitives → depends-on: term:primitive, term:primitive-type
- flow:migrate-wrappers → depends-on: flow:run-migrations, term:primitive, inv:primitive-refs-wrapped, rule:link-prose-consistency
- flow:reindex → depends-on: term:index, dec:index-rebuild-on-write
- flow:rename-primitive → depends-on: term:primitive, inv:unique-primitive-id, dec:index-rebuild-on-write
- flow:rm-primitive → depends-on: term:primitive, dec:index-rebuild-on-write
- flow:run-migrations → depends-on: term:migration, term:automatic-migration, term:manual-migration, rule:migration-required
- flow:show-primitive → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal
- flow:unlink-primitives → depends-on: term:primitive, dec:index-rebuild-on-write

## Contracts

<!-- No contracts defined yet. -->

## Decisions

- dec:auto-detect-spec-root → depends-on: term:spec-root
- dec:bidirectional-subgraph-traversal → depends-on: term:index, term:primitive
- dec:context-qualified-refs → depends-on: term:bounded-context, term:primitive, inv:unique-primitive-id
- dec:index-rebuild-on-write → depends-on: term:index
- dec:prefix-as-type-shorthand → depends-on: term:primitive-type
- dec:primitives-inside-spec → depends-on: term:spec-root
- dec:testable-primitives → depends-on: term:primitive-type

## Features

- feat:cli-add → includes: term:primitive, term:primitive-type, term:index, inv:unique-primitive-id, flow:add-primitive, dec:index-rebuild-on-write
- feat:cli-check → includes: term:primitive, term:index, flow:check-completeness, dec:bidirectional-subgraph-traversal
- feat:cli-deprecate → includes: term:primitive, flow:deprecate-primitive, dec:index-rebuild-on-write
- feat:cli-init → includes: term:spec-root, term:primitive, term:primitive-type, term:index, inv:single-spec-per-project, flow:init-spec, dec:primitives-inside-spec, dec:auto-detect-spec-root
- feat:cli-link → includes: term:primitive, term:index, inv:valid-edge-types, flow:link-primitives, flow:unlink-primitives, dec:index-rebuild-on-write
- feat:cli-list → includes: term:primitive, term:primitive-type, flow:list-primitives
- feat:cli-migrate → includes: term:migration, term:automatic-migration, term:manual-migration, rule:migration-required, flow:run-migrations
- feat:cli-reindex → includes: term:index, flow:reindex, dec:index-rebuild-on-write
- feat:cli-rename → includes: term:primitive, term:index, inv:unique-primitive-id, flow:rename-primitive, dec:index-rebuild-on-write
- feat:cli-rm → includes: term:primitive, term:index, flow:rm-primitive, dec:index-rebuild-on-write
- feat:cli-show → includes: term:primitive, term:index, flow:show-primitive, dec:bidirectional-subgraph-traversal
