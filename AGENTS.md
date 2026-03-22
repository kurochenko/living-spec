# AGENTS.md

## Project

Living Spec — a CLI tool and framework for maintaining structured domain knowledge in software projects. The CLI lets LLMs interact with a knowledge graph of typed primitives (terms, invariants, rules, events, flows, contracts, decisions, features) through commands instead of direct file manipulation.

## Living Spec

This project uses its own living spec — initialized at the repo root.

Before implementing any feature:
1. Read `.spec/SPEC.md` for the full meta-model and instructions
2. Read `.spec/INDEX.md` for the current graph of all defined primitives
3. Identify the Feature you're implementing and traverse its dependencies
4. If any referenced primitive is missing or incomplete — stop and ask, do not guess

When you discover domain knowledge that isn't captured in the spec, propose a new primitive to the user. Write it only after confirmation. Always update INDEX.md when adding or changing primitives.

## Tech stack

- TypeScript (strict mode, ESM)
- Node.js CLI — single entry point, subcommand pattern (e.g., `lore add term ...`)
- `commander` for CLI arg parsing and subcommands
- `gray-matter` for frontmatter parsing/writing
- `fs/path` for file I/O (Node built-in)
- `bun` as package manager and script runner (`bun install`, `bun run test`) — Node.js stays as runtime
- Keep dependencies minimal — these three are the full runtime stack

## Commands

```
lore init [--dir <path>]           # create .spec/ in target directory
lore add <type> <slug> [options]   # create a new primitive from template
lore show <prefix:slug> [--related]  # read a primitive or its subgraph
lore link <source> <edge> <target> # add a typed edge between two primitives
lore unlink <source> <edge> <target>
lore rm <prefix:slug> [--force]    # delete a primitive (checks for dangling refs)
lore list [--type <type>]          # list all primitives
lore deprecate <prefix:slug>       # mark a primitive as deprecated
lore reindex                       # rebuild INDEX.md from disk
lore check <prefix:slug>           # completeness check on a feature (planned)
```

IDs use qualified form `prefix:slug` in links and references. Prefixes: `term`, `inv`, `rule`, `evt`, `flow`, `con`, `dec`, `feat`. Uniqueness is scoped per type — two different types can share the same slug.

Anywhere a command takes a type as input, both the full name (`feature`) and the prefix (`feat`) are accepted. Frontmatter always stores the full name.

Every write command rebuilds INDEX.md automatically.

## Conventions

- One file per module, named after what it does (e.g., `add.ts`, `link.ts`, `index-builder.ts`)
- All file I/O goes through a single module — no scattered `fs` calls
- Frontmatter parsing/writing in one place
- Validate edge types against allowed source→target pairs
- Exit with clear error messages on invalid input — never silently succeed
- Tests use the built-in Node.js test runner
- Tests live in colocated `__tests__/` folders next to the source they test (e.g., `src/commands/__tests__/add.test.ts`)
- Shared test utilities live in `src/lib/` (e.g., `test-helpers.ts`) — not in `__tests__/`
