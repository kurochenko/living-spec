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

## Rules

<!-- No rules defined yet. -->

## Events

<!-- No events defined yet. -->

## Flows

- flow:add-primitive (lore) → depends-on: term:primitive, term:primitive-type, inv:unique-primitive-id, dec:index-rebuild-on-write
- flow:init-spec (lore) → depends-on: term:spec-root, term:primitive-type
- flow:show-primitive (lore) → depends-on: term:primitive, term:index, dec:bidirectional-subgraph-traversal

## Contracts

<!-- No contracts defined yet. -->

## Decisions

- dec:auto-detect-spec-root (lore) → depends-on: term:spec-root
- dec:bidirectional-subgraph-traversal (lore) → depends-on: term:index, term:primitive
- dec:index-rebuild-on-write (lore) → depends-on: term:index
- dec:primitives-inside-spec (lore) → depends-on: term:spec-root

## Features

- feat:cli-add (lore) → includes: term:primitive, term:primitive-type, term:index, inv:unique-primitive-id, flow:add-primitive, dec:index-rebuild-on-write
- feat:cli-init (lore) → includes: term:spec-root, term:primitive, term:primitive-type, term:index, inv:single-spec-per-project, flow:init-spec, dec:primitives-inside-spec, dec:auto-detect-spec-root
- feat:cli-show (lore) → includes: term:primitive, term:index, flow:show-primitive, dec:bidirectional-subgraph-traversal
