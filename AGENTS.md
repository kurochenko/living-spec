# AGENTS.md

## Project

Living Spec — a CLI tool and framework for maintaining structured domain knowledge in software projects. The CLI lets LLMs interact with a knowledge graph of typed primitives (terms, invariants, rules, events, flows, contracts, decisions, features) through commands instead of direct file manipulation.

## Living Spec

This project uses its own living spec — a structured knowledge base in `living-spec/`.

Before implementing any feature:
1. Read `living-spec/.spec/SPEC.md` for the full meta-model and instructions
2. Read `living-spec/.spec/INDEX.md` for the current graph of all defined primitives
3. Identify the Feature you're implementing and traverse its dependencies
4. If any referenced primitive is missing or incomplete — stop and ask, do not guess

When you discover domain knowledge that isn't captured in the spec, propose a new primitive to the user. Write it only after confirmation. Always update INDEX.md when adding or changing primitives.

## Tech stack

- TypeScript (strict mode, ESM)
- Node.js CLI — single entry point, subcommand pattern (e.g., `living-spec add term ...`)
- `commander` for CLI arg parsing and subcommands
- `gray-matter` for frontmatter parsing/writing
- `fs/path` for file I/O (Node built-in)
- Keep dependencies minimal — these three are the full runtime stack

## Commands

```
living-spec add <type> <id> [options]     # create a new primitive from template
living-spec link <source> <edge> <target> # add a typed edge between two primitives
living-spec unlink <source> <edge> <target>
living-spec deprecate <id>
living-spec update <id>                   # update the body of an existing primitive
living-spec check <feature-id>            # completeness check on a feature
living-spec show <id> [--related]         # read a primitive or its subgraph
living-spec list [--type] [--context]     # list all primitives
```

Every write command rebuilds INDEX.md automatically.

## Conventions

- One file per module, named after what it does (e.g., `add.ts`, `link.ts`, `index-builder.ts`)
- All file I/O goes through a single module — no scattered `fs` calls
- Frontmatter parsing/writing in one place
- Validate edge types against allowed source→target pairs
- Exit with clear error messages on invalid input — never silently succeed
- Tests use the built-in Node.js test runner
