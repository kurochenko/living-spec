# AGENTS.md

## Project

Living Spec — a CLI tool and framework for maintaining structured domain knowledge in software projects. The CLI lets LLMs interact with a knowledge graph of typed primitives (terms, invariants, rules, events, flows, contracts, decisions, features) through commands instead of direct file manipulation.

## Living Spec

This project uses its own living spec — initialized at the repo root.

**GOLDEN RULE: Spec before code — no exceptions.** Every change to behavior must start with creating or updating the relevant spec primitives. Propose the spec changes, get explicit user confirmation, write the primitives, THEN implement. This is non-negotiable. Skipping it has three consequences: the spec drifts from reality and loses all value; you may implement something the user disagrees with, wasting effort that must be redone; and worst, incorrect changes may slip past the user's attention entirely.

Before implementing any feature:
1. Read `.spec/SPEC.md` for the full meta-model and instructions
2. Read `.spec/INDEX.md` for the current graph of all defined primitives
3. Identify the Feature you're implementing and traverse its dependencies
4. If any referenced primitive is missing or incomplete — stop and ask, do not guess
5. Propose spec updates (new/changed primitives) and wait for confirmation
6. Write the spec primitives
7. Only then implement the code

When you discover domain knowledge that isn't captured in the spec, propose a new primitive to the user. Write it only after confirmation. Always update INDEX.md when adding or changing primitives.

### This Project's Dual Nature

This project has two interrelated concerns:

1. **It is a tool**: The `lore` CLI — a project-agnostic framework for maintaining structured domain knowledge
2. **It is a Living Spec project itself**: It uses `lore` to manage its own spec stored in `.spec/`

When `lore init` runs in a new project, it copies the seed spec from `cli/src/lib/seed/spec.ts`. This means changes to `.spec/SPEC.md` and the seed must stay in sync — they are the same content.

### How to Work on This Project

Because this project IS living spec using living spec, the "spec first" rule applies to this project's own features:

1. **Implementing a feature** (e.g., new command, new option, new behavior):
   - Create or update spec primitives in `.spec/features/`, `.spec/flows/`, `.spec/invariants/`
   - Write tests that exercise the spec primitives
   - Implement the code until tests pass

2. **Changing the spec template** (the seed):
   - Update both `.spec/SPEC.md` and `cli/src/lib/seed/spec.ts` together — they must remain identical

3. **Reviewing code**:
   - Ensure spec primitives exist for every implemented behavior
   - Ensure tests exist for invariants, rules, and flows

### Test Coverage Expectations

When implementing a feature, ensure tests cover:
- Happy path (command succeeds with valid input)
- Error paths (invalid input, ambiguous refs, missing files)
- Edge cases (disambiguation, cross-context scenarios, boundary values)

Tests run against the compiled CLI at `dist/index.js`. Run `bun run build` (or `bun run build:test` for the test tsconfig) before running tests.

### If Implementation Precedes Spec

If a feature was implemented before the spec was written (a violation), recover by:
1. Write the spec primitives that describe what was built
2. Add tests that exercise those spec primitives
3. Update `.spec/SPEC.md` and `cli/src/lib/seed/spec.ts` together

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
lore init [--dir <path>]                              # create .spec/ in target directory
lore add <type> <slug> -n <name> [-c <context>]     # create a new primitive from template
lore show <ref> [--related]                          # read a primitive or its subgraph
lore link <source> <edge> <target>                   # add a typed edge between two primitives
lore unlink <source> <edge> <target>
lore rm <ref> [--force]                              # delete a primitive (checks for dangling refs)
lore list [--type <type>] [--context <context>]       # list all primitives
lore deprecate <ref>                                 # mark a primitive as deprecated
lore reindex                                         # rebuild INDEX.md from disk
lore rename <ref> <new-slug>                         # rename a primitive, rewrite all inbound refs
lore check <ref>                                     # completeness check — reports dead refs and deprecated
```

IDs use qualified form `prefix:slug` or `context.prefix:slug` in links and references. Prefixes: `term`, `inv`, `rule`, `evt`, `flow`, `con`, `dec`, `feat`. Uniqueness is scoped per (type, context) pair.

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
